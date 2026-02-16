use tauri::command;
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AEInstallation {
    version: String,
    scripts_path: String,
    user_presets_path: String,
    exists: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct PathConfig {
    custom_scripts_path: Option<String>,
    custom_presets_path: Option<String>,
}

#[command]
fn scan_ae_installations() -> Vec<AEInstallation> {
    let mut installations = Vec::new();
    
    let versions = vec![
        "2025", "2024", "2023", "2022", "2021", "2020"
    ];
    
    for version in versions {
        let scripts_path = format!(
            "C:\\Program Files\\Adobe\\Adobe After Effects {}\\Support Files\\Scripts",
            version
        );
        
        let user_presets_path = format!(
            "{}\\Documents\\Adobe\\After Effects {}\\User Presets",
            std::env::var("USERPROFILE").unwrap_or_default(),
            version
        );
        
        // Check if paths exist
        let scripts_exists = PathBuf::from(&scripts_path).exists();
        let presets_exists = PathBuf::from(&user_presets_path).exists();
        
        // Only add if at least one path exists
        if scripts_exists || presets_exists {
            installations.push(AEInstallation {
                version: version.to_string(),
                scripts_path: scripts_path.clone(),
                user_presets_path: user_presets_path.clone(),
                exists: scripts_exists && presets_exists,
            });
        }
    }
    
    installations
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
