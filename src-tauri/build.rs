use std::fs;
use std::path::Path;

fn main() {
    if !Path::new("../dist").exists() {
        fs::create_dir("../dist").expect("Failed to create dist directory");
    }
    
    tauri_build::build()
}
