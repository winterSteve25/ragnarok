// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::http::ResponseBuilder;
use tauri::{Manager, Window};

mod fs;
mod errors;

#[tauri::command]
async fn close_splashscreen(window: Window) -> Result<(), tauri::Error>{
    match window.get_window("splashscreen") {
        Some(window) => window.close()?,
        None => {}
    };
    
    window.get_window("main")
        .expect("no window labeled 'main' found")
        .show()?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            fs::get_files_in_path,
            fs::open_text_file,
            close_splashscreen
        ])
        .register_uri_scheme_protocol("openimage", |app, req| {
            let failed = ResponseBuilder::new()
                .header("Origin", "*")
                .header("Access-Control-Allow-Origin", "*")
                .status(200)
                .body(vec![]);
            
            println!("{:?}", req.uri());
            
            return failed;
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
