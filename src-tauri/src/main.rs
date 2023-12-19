// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::PackageInfo;

mod fs;
mod errors;
mod lsp;

pub static mut PACKAGE_INFO: Option<PackageInfo> = None;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fs::get_files_in_path,
            fs::open_text_file,
            lsp::start_ls,
        ])
        .setup(|app| Ok(unsafe {
            PACKAGE_INFO = Some(app.package_info().clone());
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}