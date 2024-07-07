use anyhow_tauri::bail;
use anyhow_tauri::IntoTAResult;
use std::path::PathBuf;
use std::str::FromStr;
use tauri_plugin_dialog::DialogExt;

#[tauri::command]
fn handle_input(
    input_format: &str,
    input_path: Option<&str>,
    app_handle: tauri::AppHandle,
) -> anyhow_tauri::TAResult<PathBuf> {
    if let Some(path) = input_path {
        return Ok(PathBuf::from_str(path).into_ta_result()?);
    } else {
        let file_response_option = app_handle
            .dialog()
            .file()
            .add_filter("Input Format", &[input_format])
            .blocking_pick_file();
        if let Some(file_response) = file_response_option {
            Ok(file_response.path)
        } else {
            bail!("Could not identify a file.")
        }
    }
}

#[tauri::command]
fn handle_output(
    input_path: &str,
    output_format: &str,
    app_handle: tauri::AppHandle,
) -> anyhow_tauri::TAResult<()> {
    let output_pathbuf_option = app_handle
        .dialog()
        .file()
        .add_filter("Output Format", &[output_format])
        .blocking_save_file();
    if let Some(output_pathbuf) = output_pathbuf_option {
        let img = image::open(input_path).into_ta_result()?;
        img.into_rgb8().save(&output_pathbuf).into_ta_result()?;
        Ok(showfile::show_path_in_file_manager(output_pathbuf))
    } else {
        bail!("Could not identify an output file path.")
    }
}

#[tauri::command]
fn show_file(file_path: PathBuf) {
    showfile::show_path_in_file_manager(file_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            handle_input,
            handle_output,
            show_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
