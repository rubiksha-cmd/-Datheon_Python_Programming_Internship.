export const CATEGORY_MAP: Record<string, string[]> = {
  Documents: [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx", ".csv", ".odt"],
  Images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico"],
  Videos: [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv"],
  Archives: [".zip", ".tar", ".gz", ".rar", ".7z"],
  Code: [".py", ".js", ".ts", ".html", ".css", ".json", ".cpp", ".c", ".java"],
};

const EXTENSION_TO_CATEGORY: Record<string, string> = {};
for (const [category, exts] of Object.entries(CATEGORY_MAP)) {
  for (const ext of exts) {
    EXTENSION_TO_CATEGORY[ext] = category;
  }
}

export function getCategory(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return "Others";
  const ext = fileName.slice(dotIndex).toLowerCase();
  return EXTENSION_TO_CATEGORY[ext] ?? "Others";
}

export function shouldSkip(name: string): boolean {
  if (name.startsWith(".") || name.startsWith("~")) return true;
  return false;
}

export interface FileEntry {
  name: string;
  category: string;
}

export interface ScanResult {
  files: FileEntry[];
  categoryCounts: Record<string, number>;
  total: number;
  skipped: number;
}

export async function scanDirectory(dirHandle: FileSystemDirectoryHandle): Promise<ScanResult> {
  const files: FileEntry[] = [];
  const categoryCounts: Record<string, number> = {};
  let skipped = 0;

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind !== "file") continue;
    if (shouldSkip(name)) {
      skipped++;
      continue;
    }

    const category = getCategory(name);
    files.push({ name, category });
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
  }

  files.sort((a, b) => a.name.localeCompare(b.name));

  return {
    files,
    categoryCounts,
    total: files.length,
    skipped,
  };
}

export interface OrganizeResult {
  moved: Record<string, number>;
  errors: string[];
  totalMoved: number;
}

async function uniqueName(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<string> {
  let candidate = fileName;
  if (!(await dirHandle.getFileHandle(candidate, { create: false }).catch(() => null))) {
    return candidate;
  }

  const dotIndex = fileName.lastIndexOf(".");
  const stem = dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
  const ext = dotIndex === -1 ? "" : fileName.slice(dotIndex);

  let counter = 1;
  while (true) {
    candidate = `${stem}_${counter}${ext}`;
    if (!(await dirHandle.getFileHandle(candidate, { create: false }).catch(() => null))) {
      return candidate;
    }
    counter++;
  }
}

export async function organizeDirectory(
  rootHandle: FileSystemDirectoryHandle,
  scan: ScanResult,
  onProgress?: (current: number, total: number, name: string) => void
): Promise<OrganizeResult> {
  const moved: Record<string, number> = {};
  const errors: string[] = [];
  let totalMoved = 0;
  const total = scan.files.length;

  // Group files by category to create folders lazily.
  const byCategory: Record<string, FileEntry[]> = {};
  for (const file of scan.files) {
    if (!byCategory[file.category]) byCategory[file.category] = [];
    byCategory[file.category].push(file);
  }

  for (const [category, fileEntries] of Object.entries(byCategory)) {
    let categoryDir: FileSystemDirectoryHandle;
    try {
      categoryDir = await rootHandle.getDirectoryHandle(category, { create: true });
    } catch {
      for (const f of fileEntries) {
        errors.push(`${f.name} — could not create ${category} folder`);
      }
      continue;
    }

    for (const fileEntry of fileEntries) {
      onProgress?.(totalMoved + errors.length + 1, total, fileEntry.name);

      try {
        const srcFile = await rootHandle.getFileHandle(fileEntry.name);
        const srcFileObj = await srcFile.getFile();
        const destName = await uniqueName(categoryDir, fileEntry.name);
        const destFile = await categoryDir.getFileHandle(destName, { create: true });
        const writable = await destFile.createWritable();
        await writable.writeFile(srcFileObj);
        await writable.close();
        await rootHandle.removeEntry(fileEntry.name);

        moved[category] = (moved[category] ?? 0) + 1;
        totalMoved++;
      } catch (err) {
        errors.push(`${fileEntry.name} — ${err instanceof Error ? err.message : "unknown error"}`);
      }
    }
  }

  return { moved, errors, totalMoved };
}
