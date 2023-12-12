// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};

mod fs;
mod errors;
mod lsp;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fs::get_files_in_path,
            fs::open_text_file,
            lsp::start_client,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}