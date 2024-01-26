use std::cmp::Ordering;
use std::fs::DirEntry;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::errors::FSError;

#[derive(Debug, Serialize, Deserialize)]
pub struct File {
    filename: String,
    filepath: String,
    filetype: FileType,
    hidden: bool,
}

#[derive(Debug, Serialize, Deserialize, Ord, PartialOrd, Eq, PartialEq)]
pub enum FileType {
    File,
    Symlink,
    Directory,
    Unknown,
}

#[tauri::command]
pub fn get_files_in_path(path: String) -> Result<Vec<File>, FSError> {
    let path = PathBuf::from(shellexpand::tilde(&path).to_string());
    let mut dir = path
        .read_dir()?
        .filter_map(|entry| entry.map(|entry| {
            File {
                hidden: is_file_hidden(&entry),
                filename: entry.file_name().to_string_lossy().to_string(),
                filepath: entry.path().to_string_lossy().to_string(),
                filetype: match entry.file_type() {
                    Ok(ft) => {
                        if ft.is_file() {
                            FileType::File
                        } else if ft.is_dir() {
                            FileType::Directory
                        } else if ft.is_symlink() {
                            FileType::Symlink
                        } else {
                            FileType::Unknown
                        }
                    }
                    Err(_) => FileType::Unknown
                },
            }
        }).ok())
        .collect::<Vec<File>>();

    dir.sort_by(|a, b| {
        match (&a.filetype, &b.filetype) {
            (FileType::Directory, FileType::Directory) => a.filename.cmp(&b.filename),
            (FileType::File, FileType::File) => a.filename.cmp(&b.filename),
            (FileType::Directory, FileType::File) => Ordering::Less,
            (FileType::File, FileType::Directory) => Ordering::Greater,
            (_, _) => Ordering::Equal,
        }
    });

    Ok(dir)
}

#[tauri::command]
pub async fn open_text_file(path: String) -> Result<String, FSError> {
    let content = tokio::fs::read_to_string(path).await?;
    Ok(content)
}

#[cfg(target_family="unix")]
fn is_file_hidden(entry: &DirEntry) -> bool {
    entry.file_name().to_string_lossy().to_string().starts_with(".")
}

#[tauri::command]
pub async fn write_file(buffer: String, path: String) -> Result<(), FSError> {
    tokio::fs::write(path, buffer).await?;
    Ok(())
}

#[cfg(target_family = "windows")]
use std::os::windows::prelude::MetadataExt;

#[cfg(target_family="windows")]
fn is_file_hidden(entry: &DirEntry) -> bool {
    match entry.metadata() { 
        Ok(meta) => meta.file_attributes() & 0x00000002 == 0,
        Err(_) => false,
    }
}
