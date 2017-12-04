// UI
var timeline;
var play_button;
var save_json_button;
var load_json_button;
var render_button;
var load_grid_button;
var next_path_button;
var prev_path_button;
var clear_path_button;
var prev_grid_button;
var prev_next_button;
var load_face_button;
var generate_grid_button;

var webcam_enabled = false;

function Timeline()
{
    var element = document.getElementById('timeline');
    var frame_readout = document.getElementById('timeline-counter');
    var scrubbing = false;
    
    // Timeline Data
    Object.defineProperty(this, 'value',
    {   get: function(){return element.value;},
        set: function(value){element.value = value;}
    });

    Object.defineProperty(this, 'max',
    {   get: function(){return element.max;},
        set: function(value){element.max = value;}
    });

    // Methods
    Timeline.prototype.setup = function()
    {   element.onchange = this.on_change;
        element.oninput = this.on_change;
        element.onmouseup = this.on_up;
    }

    Timeline.prototype.on_up = function()
    {
        if(scrubbing)
        {   scrubbing = false;
            log_event('UI', 'Playback', 'Scrub');
        }
    }

    Timeline.prototype.on_change = function()
    {   animation.go_to_frame(Math.round(element.value));
        animation.pause();
        play_button.update_state();
        //console.log(element.clientLeft + element.clientWidth);

        if(!scrubbing)
        {   scrubbing = true;
        }
    }

    Timeline.prototype.update_length = function()
    {   // Update's timeline length to reflect the current animation state
        if(animation.data.path.length > 0)
        {   this.max = animation.data.path.length - 1;
            this.value = animation.current_frame;
        }
    }

    Timeline.prototype.update_width = function()
    {
        //element.style.width = '100%';
        //element.style.width = (element.clientWidth - play_button.element.clientWidth - 6) + 'px';
    }

    this.setup();
}

function RenderButton()
{   
    this.element = document.getElementById('render-button');
    var render_button = this;

    this.on_click = function()
    {   //console.log(renderer.rendering);
        if(!renderer.rendering)
        {
            renderer.setup_render(animation.data, animation.data.path.length-1);
            renderer.start_render();
        }
        else if(renderer.rendering)
        {   
            renderer.stop_render();
        }
    }

    RenderButton.prototype.set_label = function(message)
    {   this.element.innerHTML = message;
        if(renderer.rendering)
        {
            this.element.innerHTML = message + ' (Click to cancel)';
        }
    }

    RenderButton.prototype.reset_label_in = function(timer)
    {   
        setTimeout(
            function()
            {
                if(!renderer.rendering)
                {
                    render_button.set_label('Render Animation');
                }
            }, 
            timer
        );
    }

    RenderButton.prototype.setup = function ()
    {   
       this.element.onclick = this.on_click;
       this.set_label('Render Animation');
    }

    this.setup();
}

function PlayButton()
{   
    this.element = document.getElementById('play-button');
    var play_button = this;

    this.on_click = function()
    {   animation.toggle_play();
        play_button.update_state();

        if(animation.is_playing())
        {
            log_event('UI', 'Playback', 'Play');
        }
        else
        {
            log_event('UI', 'Playback', 'Pause');
        }
    }

    PlayButton.prototype.update_state = function ()
    {
        if(animation.is_playing())
        {   get_id('play-button-icon').src='./imgs/icons/ic_stop_black_24px.svg';
            //element.innerText = 'Pause';
        }
        else
        {   get_id('play-button-icon').src='./imgs/icons/ic_play_arrow_black_24px.svg';
            //element.innerText = 'Play';
        }
    }

    PlayButton.prototype.setup = function ()
    {   
        this.element.onclick = this.on_click;
        this.update_state();
    }

    this.setup();
}

function SaveJsonButton()
{   // Save Path
    var element = document.getElementById('save-json-button');
    var button = this;

    this.on_context_click = function(e)
    {
        button.append_json();
        log_event('UI', 'Path', 'Save');
    }

    this.on_click = function(e)
    {
        //console.log("Saving JSON");
        //button.append_json(); // Allows "right click and save as" functionality
    }

    SaveJsonButton.prototype.append_json = function()
    {   // Get current json data from Animation.data and append it to link element
        // Adapted from: http://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
        let json = animation.data.get_json();
        var data = "text/json;charset=utf-8," + encodeURIComponent(json);
        element.href = 'data:' + data;
    }
    SaveJsonButton.prototype.setup = function ()
    {   
        element.onclick = this.on_click;
        element.oncontextmenu = this.on_context_click;    
    }

    this.setup();
}

function LoadJsonButton()
{   // Load Path
    var element = document.getElementById('load-json-button');
    var button = this;

    this.on_change = function(e)
    {   // From: https://developer.mozilla.org/en/docs/Using_files_from_web_applications
        animation.data.load_path(e.target.files);
    }

    LoadJsonButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}



function NextPathButton()
{
    var element = document.getElementById('next-path-button');
    element.onclick = function()
    {
        log_event('UI', 'Path', 'Next');
        animation.data.next_path();
    }
}

function PrevPathButton()
{
    var element = document.getElementById('prev-path-button');
    element.onclick = function()
    {
        animation.data.prev_path();
        log_event('UI', 'Path', 'Prev');
    }
}

function ClearPathButton()
{
    var element = document.getElementById('clear-button');
    element.onclick = function()
    {
        animation.data.clear();
        log_event('UI', 'Path', 'Clear');
    }
}

function NextGridButton()
{
    var element = document.getElementById('next-grid-button');
    element.onclick = function()
    {
        animation.data.next_grid();
        log_event('UI', 'Grid', 'Next');
    }
}

function PrevGridButton()
{
    var element = document.getElementById('prev-grid-button');
    element.onclick = function()
    {
        animation.data.prev_grid();
        log_event('UI', 'Grid', 'Prev');
    }
}

function LoadGridButton()
{
    var element = document.getElementById('load-grid-button');
    var button = this;

    this.on_change = function(e)
    {   // From: https://stackoverflow.com/questions/12368910/html-display-image-after-selecting-filename
        let selected_file = e.target.files[0];
        
        let file_reader = new FileReader();

        file_reader.onload = function(e)
        {
            animation.data.add_grid_image(e.target.result, 7, 7, selected_file.name, true);
            //console.log(selected_file.name);
        }
        
        file_reader.readAsDataURL(selected_file);
    }

    LoadGridButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}

function LoadFaceButton()
{
    var element = document.getElementById('load-face-input');
    var button = this;
    
    this.on_change = function(e)
    {   // From: https://stackoverflow.com/questions/12368910/html-display-image-after-selecting-filename
        
        let selected_file = e.target.files[0];

        if(allowed_file(selected_file.name))
        {
            let file_reader = new FileReader();
            generate_grid_button.set_input_image(selected_file);

            file_reader.onload = function(e)
            {
                //animation.data.add_grid_image(e.target.result, 7, 7, selected_file.name, true);
        
                let blob = dataURItoBlob(e.target.result);
                let image_to_upload = URL.createObjectURL(blob);
                //console.log(blob);
                set_input_image(image_to_upload);
                get_id('gen-face-image-text-state').innerText = 'Using Image File';
            }
            
            file_reader.readAsDataURL(selected_file);
        }
    }

    LoadFaceButton.prototype.setup = function ()
    {   
        element.onchange = this.on_change;
    }

    this.setup();
}

function GenerateGridButton()
{   // Load Path
    var element = document.getElementById('generate-grid-button');
    var button = this;
    this.stored_imagefile;

    this.on_click = function(e)
    {   console.log(button.stored_imagefile);
        if(button.stored_imagefile != null)
        {   
            requests.request_grid(button.stored_imagefile);
        }
    }

    GenerateGridButton.prototype.setup = function ()
    {   
        element.onclick = this.on_click;
    }

    GenerateGridButton.prototype.set_input_image = function(file)
    {   //console.log(file);
        this.stored_imagefile = file;
    }

    GenerateGridButton.prototype.clear_input_image = function()
    {
        this.stored_imagefile = null;
    }

    this.setup();
}


function setup_ui()
{   // Prevent middle click pan from messing up window
    document.addEventListener ("click", function (e) 
    {   if (e.which === 2) 
        e.preventDefault();
    });

    get_id('anim-grid-hface-button').onclick = function()
    {   grid_close_menus();    
        get_id('anim-grid-hface-container').style.display = 'block';
    };  

    get_id('anim-grid-vface-button').onclick = function()
    {   grid_close_menus();
        get_id('anim-grid-vface-container').style.display = 'block';
    };

    get_id('anim-grid-size-button').onclick = function()
    {   grid_close_menus();
        get_id('anim-grid-size-container').style.display = 'block';
    };

    get_id('generate-face-button').onclick = function(event)
    {   get_id('gen-face-diag').style.display = 'block';
    }

    get_id('gen-face-diag').onmouseleave = function(event)
    {   get_id('gen-face-diag').style.display = 'none';
    }

    get_id('anim-grid-hface-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    get_id('anim-grid-size-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    get_id('anim-grid-vface-container').onmouseleave = function(event)
    {  grid_close_menus();
    }

    /*
    get_id('anim-grid-hface-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };

    get_id('anim-grid-vface-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };

    get_id('anim-grid-size-container').onclick = function(event)
    {   // Here to stop mouse event from bubbling up to parent button 
        // (which will stop it from hiding the face container)
        event.stopPropagation();
    };
    */

    play_button = new PlayButton();
    save_json_button = new SaveJsonButton();
    load_json_button = new LoadJsonButton();
    render_button = new RenderButton();
    load_grid_button = new LoadGridButton();
    timeline = new Timeline();

    load_face_button = new LoadFaceButton();

    next_path_button = new NextPathButton();
    prev_path_button = new PrevPathButton();
    clear_path_button = new ClearPathButton();
    prev_grid_button = new PrevGridButton();
    prev_next_button = new NextGridButton();

    generate_grid_button = new GenerateGridButton();
}

function grid_haxis_selected(face)
{   get_id('anim-grid-hface-disp').innerText = face;
    grid_close_menus();
}

function grid_vaxis_selected(face)
{   get_id('anim-grid-vface-disp').innerText = face;
    grid_close_menus();
}

function grid_size_selected(size)
{   get_id('anim-grid-size-disp').innerText = size;
    grid_close_menus();
}

function grid_close_menus()
{   get_id('anim-grid-hface-container').style.display = 'none';
    get_id('anim-grid-vface-container').style.display = 'none';
    get_id('anim-grid-size-container').style.display = 'none';
}

function set_input_image(image_url)
{
    get_id('gen-face-upload-disp').style.backgroundImage = 'url('+image_url+')';
    get_id('gen-face-image-text-def').style.display = 'none';
    get_id('gen-face-image-text-state').style.display = 'block';
}

function webcam_hide()
{   get_id('gen-face-webcam-disp').style.display = 'none';
    get_id('gen-face-webcam-text').style.display = 'block';
}

function webcam_show()
{   if(!webcam_enabled)
    {   webcam_enabled = true;
        setup_webcam();
    }
    get_id('gen-face-webcam-flash').style.display= 'block';
    get_id('gen-face-webcam-disp').style.display = 'block';
    get_id('gen-face-webcam-text').style.display = 'none';
}

function webcam_snap()
{   Webcam.snap( function(data_uri) {
        //console.log(data_uri);
        //document.getElementById('my_result').innerHTML = '<img src="'+data_uri+'"/>';
        
        let blob = dataURItoBlob(data_uri);
        let image_to_upload = URL.createObjectURL(blob);

        // Get DataURI image format
        let semicolon = data_uri.indexOf(";");
        let fslash = data_uri.indexOf("/");
        let format = data_uri.substring(fslash+1,semicolon);

        let webcam_image = blobToFile(blob, "webcam."+format);
        
        if(allowed_file(webcam_image.name))
        {
            generate_grid_button.set_input_image(webcam_image);    
            get_id('gen-face-image-text-state').innerText = 'Using Webcam';
            set_input_image(image_to_upload);
            //console.log(image_to_upload);        
        }
    } );
}

function webcam_click()
{   if(webcam_enabled)
    {   webcam_snap();
    }
    webcam_show();
}

// WEBCAM
function setup_webcam()
{
    Webcam.set({
        width: 144,
        height: 108,
        dest_width: 640,
        dest_height: 480,
        crop_width: 480,
        crop_height: 480,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach( '#gen-face-webcam-disp' );
}
