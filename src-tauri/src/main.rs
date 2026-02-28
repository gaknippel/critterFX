#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
//testing :D
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
fn verify_path(path: String) -> Result<bool, String> {
    let path_buf = PathBuf::from(&path);
    
    Ok(path_buf.exists())
}


#[tauri::command]
fn get_path_config(app: tauri::AppHandle) -> Result<PathConfig, String>{ //can succeed and return path config, or fail and return message
    let app_dir = app.path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let config_path = app_dir.join("path_config.json");

    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| e.to_string())?; //error mapping
        
        let config: PathConfig = serde_json::from_str(&content)
            .map_err(|e| e.to_string())?; //error mapping
        
        Ok(config)
    } 
    else { //will execute first time launch, since no custom stuff
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
fn install_preset(
    app: tauri::AppHandle,
    preset_type: String, 
    file_name: String,
    source_path: String
) -> Result<String, String> {


    println!("install preset called");

    let config = get_path_config(app.clone())?;

        let dest_dir = match preset_type.as_str() 
        {
        "script" => 
        {
            //use custom path if available, otherwise default
            if let Some(custom_path) = config.custom_scripts_path 
            {
                PathBuf::from(custom_path)
            } 
            else 
            {
                //try to find AE installation
                let installations = scan_ae_installations();
                if let Some(first) = installations.first() 
                {
                    PathBuf::from(&first.scripts_path)
                } 
                else 
                {
                    return Err("no AE installation found. configute path in settings.".to_string());
                }
            }
        },
        "preset" => 
        {
            if let Some(custom_path) = config.custom_presets_path 
            {
                PathBuf::from(custom_path)
            } 
            else 
            {
                let installations = scan_ae_installations();
                if let Some(first) = installations.first() 
                {
                    PathBuf::from(&first.user_presets_path)
                }
                else
                {
                    return Err("no AE installation found. configute path in settings.".to_string());
                }
            }
        },
        _ => return Err("invalid preset type".to_string())
    };
    
    println!("   dest_dir: {:?}", dest_dir);
    
    // create directory if needed
    if !dest_dir.exists() {
        println!("creating directory...");
        fs::create_dir_all(&dest_dir).map_err(|e| {
            println!("failed to create dir: {}", e);
            e.to_string()
        })?;
    }
    
    let mut dest_path = dest_dir.clone();
    dest_path.push(&file_name);
    
    println!("   copying from: {:?}", source_path);
    println!("   copying to: {:?}", dest_path);
    
    if preset_type == "script" 
    {
    // try normal copy first
    match fs::copy(&source_path, &dest_path) 
    {
        Ok(_) => 
        {
            println!("copied without elevation");
        },
        Err(_) => 
        {
            println!("u need sigma admin perms foid");
            #[cfg(windows)]
            request_admin_and_copy(&source_path, dest_path.to_str().unwrap())?;
        }
    }
    } 
    else 
    {
        // presets dont need admin
        fs::copy(&source_path, &dest_path).map_err(|e| e.to_string())?;
    }
    
    println!("success!");
    Ok(format!("successfully installed {} to after effects", file_name))
}

#[cfg(windows)]
fn request_admin_and_copy(source: &str, dest: &str) -> Result<(), String> {
    use std::process::Command;
    use std::os::windows::process::CommandExt;
    
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    
    // Use PowerShell to elevate and copy
    let script = format!(
        "Start-Process powershell -WindowStyle Hidden -Verb RunAs -ArgumentList '-WindowStyle Hidden -Command \"Copy-Item -Path ''{}'' -Destination ''{}'' -Force\"'",
        source, dest
    );
    
    let output = Command::new("powershell")
        .args(&["-WindowStyle", "Hidden", "-Command", &script])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(())
    } else {
        Err("user denied admin access or copy failed".to_string())
    }
}



fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            scan_ae_installations,
            verify_path,
            get_path_config,
            save_path_config,
            install_preset
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}