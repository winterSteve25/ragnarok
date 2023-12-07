use std::fs;
use std::path::Path;

fn main() {
    
    if !Path::new("../dist").exists() {
        fs::create_dir("../dist").expect("Failed to create dist directory");
    }
    
    fs::copy("../splashscreen.html", "../dist/splashscreen.html")
        .expect("failed to copy over splashscreen.html");
    
    tauri_build::build()
}
