class nbs {
    constructor(buffer) {
        this.offset = 0;

        this.dv = new DataView(buffer);

        this.nbsver = 0;

        if (this.buffer_read_short() == 0) {
            this.nbsver = this.buffer_read_byte()
        }

        if (this.nbsver != 5) {
            alert("わーりんぐ!: このnbsファイルは対応したバージョンでないです!(var:%d)\nバージョン5を推奨します!", this.nbsver)
        }

        if (this.nbsver >= 1) this.Custom_instrument_index = this.buffer_read_byte();	// Custom instrument index
        if (this.nbsver >= 3) this.Song_length = this.buffer_read_short();	// Song length

        this.height = this.buffer_read_short();
        this.Song_name = this.buffer_read_string_int();	// Song name
        this.Soung_author = this.buffer_read_string_int();	// Soung author
        this.Song_original_author = this.buffer_read_string_int();	// Song original author
        this.Tempo = this.buffer_read_string_int()	// Song description
        this.Autosave = this.buffer_read_short()			// Tempo
        this.Autosave_minutes = this.buffer_read_byte()			// Autosave
        this.Time_signature = this.buffer_read_byte()			// Autosave minutes
        this.Minutes_spent = this.buffer_read_byte()			// Time signature
        this.Minutes_spent = this.buffer_read_int()			// Minutes spent
        this.Left_clicks = this.buffer_read_int()			// Left-clicks
        this.Right_clicks = this.buffer_read_int()			// Right-clicks
        this.Blocks_added = this.buffer_read_int()			// Blocks added
        this.Blocks_removed = this.buffer_read_int()			// Blocks removed
        this.MIDI_filename = this.buffer_read_string_int()	// MIDI filename

        if (this.nbsver >= 4) {
            this.Loop = this.buffer_read_byte()		// Loop
            this.Loop_count = this.buffer_read_byte()		// Loop count
            this.Loop_start_tick = this.buffer_read_short()		// Loop start tick
        }

        // Note blocks
        this.Note_blocks=[]

        while (true) {
            let a = this.buffer_read_short();
            if (a == 0) break
            let t = [];
            for(let i=1;i<a;i++){
                this.Note_blocks.push([]);
            }
            while (true) {

                a = this.buffer_read_short();
                if (a == 0) break;
                let Instrument = this.buffer_read_byte();		// Instrument
                let Key =this.buffer_read_byte();		// Key
                let Velocity =this.buffer_read_byte();	// Velocity
                let Pan =this.buffer_read_byte();	// Pan
                let Pitch =this.buffer_read_short();	// Pitch

                t.push([Instrument,Key,Velocity,Pan,Pitch]);
                console.log(this.offset);
            }
            this.Note_blocks.push(t);
            
        }


    }

    buffer_read_byte() {
        let t = this.dv.getInt8(this.offset);
        this.offset += 1;
        return t;
    }

    buffer_read_short() {
        let t = this.dv.getInt8(this.offset);
        let t1 = this.dv.getInt8(this.offset + 1);
        this.offset += 2;
        return t + t1 * 0x10;
    }

    buffer_read_int() {
        let t = this.dv.getInt8(this.offset);
        let t1 = this.dv.getInt8(this.offset + 1);
        let t2 = this.dv.getInt8(this.offset + 2);
        let t3 = this.dv.getInt8(this.offset + 3);
        this.offset += 4;
        return t + t1 * 0x10 + t2 * 0x100 + t3 * 0x1000;
    }

    buffer_read_string_int() {
        // buffer_read_string_int()
        // Reads a string consisting of an int, then that many utf - 8 characters.

        var str = "";
        var len = this.buffer_read_int();
        for (let i = 0; i < len; i++) {
            let t = this.buffer_read_byte();
            str += (new TextDecoder).decode(new Uint8Array([t]));
        }
        return str
    }
}

function load_instruments(argument0) {
    // load_instruments(filename)
    // Loads custom instruments from a song and adds them to the current song.

    var fn, a, b, nbsver, height;
    fn = argument0
    if (fn = "") {
        if (!directory_exists_lib(songfolder)) songfolder = songs_directory
        fn = string(get_open_filename_ext("Note Block Songs (*.nbs)|*.nbs", "", songfolder, "Load instruments from song"))
    }
    if (fn = "" || !file_exists_lib(fn)) return 0
    buffer = buffer_import(fn)

    if (buffer_read_short() == 0) {
        nbsver = buffer_read_byte()
    } else {
        nbsver = 0
    }

    // Future version
    if (nbsver > nbs_version) {
        console.log("Warning: You are opening an NBS file created in a later version of Note Block Studio.\nPlease save the song as a version " + string(nbs_version) + " file or lower via the Save Options menu.", "Error")
        return -1
    }

    // Header
    if (nbsver >= 1) buffer_read_byte()		// Custom instrument index
    if (nbsver >= 3) buffer_read_short()	// Song length
    height = buffer_read_short()
    buffer_read_string_int()	// Song name
    buffer_read_string_int()	// Soung author
    buffer_read_string_int()	// Song original author
    buffer_read_string_int()	// Song description
    buffer_read_short()			// Tempo
    buffer_read_byte()			// Autosave
    buffer_read_byte()			// Autosave minutes
    buffer_read_byte()			// Time signature
    buffer_read_int()			// Minutes spent
    buffer_read_int()			// Left-clicks
    buffer_read_int()			// Right-clicks
    buffer_read_int()			// Blocks added
    buffer_read_int()			// Blocks removed
    buffer_read_string_int()	// MIDI filename
    if (nbsver >= 4) {
        buffer_read_byte()		// Loop
        buffer_read_byte()		// Loop count
        buffer_read_short()		// Loop start tick
    }

    // Note blocks
    while (true) {
        a = buffer_read_short()
        if (a = 0) break
        while (true) {
            a = buffer_read_short()
            if (a = 0) break
            buffer_read_byte()		// Instrument
            buffer_read_byte()		// Key
            if (nbsver >= 4) {
                buffer_read_byte()	// Velocity
                buffer_read_byte()	// Pan
                buffer_read_short()	// Pitch
            }
        }
    }
    if (buffer_is_eof()) {
        console.log("This file does not contain any custom instruments.", "Error")
        return 0
    }

    // Layers
    for (b = 0; b < height; b++) {
        buffer_read_string_int()			// Layer name
        if (nbsver >= 4) buffer_read_byte()	// Layer lock
        buffer_read_byte()					// Layer volume
        if (nbsver >= 2) buffer_read_byte()	// Layer stereo
    }
    if (buffer_is_eof()) {
        console.log("This file does not contain any custom instruments.", "Error")
        return 0
    }

    // Instruments
    a = buffer_read_byte()
    if (a = 0) {
        console.log("This file does not contain any custom instruments.", "Error")
        return 0
    }
    for (b = 0; b < a; b++) {
        var name = buffer_read_string_int()
        var filename = buffer_read_string_int()
        var key = buffer_read_byte()
        var press = buffer_read_byte()
        var ins = new_instrument(name, filename, true, press, key)
        with (ins)
        instrument_load()
        ds_list_add(instrument_list, ins)
    }
    changed = true




}
