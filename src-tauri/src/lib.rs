#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)] //deserialize and serialize allow to convert
struct AEInstallation {                         //to JSON
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

#[tauri::command]
fn scan_ae_installations() -> Vec<AEInstallation> { //main fn for scanning your AE
    let mut installations = Vec::new();
    
    //ae from 2025 to 2020
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
        
        // check if paths exist
        let scripts_exists = PathBuf::from(&scripts_path).exists();
        let presets_exists = PathBuf::from(&user_presets_path).exists();
        
        // only add if at least one path exists
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

#[tauri::command] //verify if we can actually write files to adobe location
fn verify_path(path: String) -> Result<bool, String> { //returns true or error
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists(){
        return Ok(false);
    }

    let test_file = path_buf.join(".ae_preset_manager_test");

    match fs::write(&test_file, "test") {
        Ok(_) => {
            //clean up the test file
            let _ = fs::remove_file(test_file);
            Ok(true)

        }

        Err(_) => Ok(false)
    }
}

#[tauri::command]
fn get_path_config(app: tauri::AppHandle) -> Result<PathConfig, String>{ //can succeed and return path config, or fail and return message
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let config_path = app_dir.join("path_config.json")

    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| e.to_string())?; //error mapping
        
        let config: PathConfig = serde_json::from_str(&content)
            .map_err(|e| e.to_string())?; //error mapping
        
        Ok(config)
    } else { //will execute first time launch, since no custom stuff
        Ok(PathConfig { 
            custom_scripts_path: None,
            custom_presets_path: None,
        })
    }
}

#[tauri::command]
fn save_path_config(
    app: tauri::AppHandle,
    scripts_path: Option<String>,
    presets_path: Option<String>) -> Result<(), String> 
{
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    // create app data dir if it doesn't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| e.to_string())?;
    }
    
    let config = PathConfig {
        custom_scripts_path: scripts_path,
        custom_presets_path: presets_path,
    };
    
    let config_json = serde_json::to_string_pretty(&config)
        .map_err(|e| e.to_string())?;
    
    let config_path = app_dir.join("path_config.json");
    fs::write(&config_path, config_json)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn install_preset(preset_type : String, file_name: String, source_path: String) -> Result<String, String> {
    let dest_dir = match preset_type.as_str() 
    {
        "script" => 
        {
            PathBuf::from("C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\Scripts")
        },
        "preset" => 
        {
            let mut path = PathBuf::from(std::env::var("USERPROFILE").unwrap());
            path.push("Documents\\Adobe\\After Effects\\User Presets");
            path
        },
        _ => return Err("invalid preset type".to_string())
    };

    // create directory if it doesn't exist
    if !dest_dir.exists() 
    {
        fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;
    }

    // build destination file path
    let mut dest_path = dest_dir.clone();
    dest_path.push(&file_name);

    // copy file from source to destination
    fs::copy(&source_path, &dest_path)
        .map_err(|e| e.to_string())?;
    
    Ok(format!("successfully installed {} to after effects", file_name))
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
