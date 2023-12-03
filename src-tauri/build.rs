use std::fs;

fn main() {
    fs::copy("../splashscreen.html", "../dist/splashscreen.html")
        .expect("failed to copy over splashscreen.html");
    tauri_build::build()
}
