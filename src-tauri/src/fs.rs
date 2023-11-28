use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::errors::FSError;

#[derive(Debug, Serialize, Deserialize)]
pub struct File {
    filename: String,
    filepath: String,
    filetype: FileType,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum FileType {
    File,
    Directory,
    Symlink,
    Unknown,
}

#[tauri::command]
pub fn get_files_in_path(path: String) -> Result<Vec<File>, FSError> {
    let path = PathBuf::from(path);
    let dir = path
        .read_dir()?
        .filter_map(|entry| entry.map(|entry| {
            File {
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
    
    Ok(dir)
}

#[tauri::command]
pub fn open_text_file(path: String) -> Result<String, FSError> {
    Ok(fs::read_to_string(path)?)
}