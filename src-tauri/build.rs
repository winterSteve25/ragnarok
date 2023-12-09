use std::fs;
use std::path::Path;

fn main() {
    if !Path::new("../dist").exists() {
        fs::create_dir("../dist").expect("Failed to create dist directory");
    }
    
    if Path::new("../dist/splashscreen.html").exists() { 
        fs::remove_file("../dist/splashscreen.html")
            .expect("Failed to remove old splashscreen");
    }
    
    fs::copy("../splashscreen.html", "../dist/splashscreen.html")
        .expect("failed to copy over splashscreen.html");
    
    tauri_build::build()
}
