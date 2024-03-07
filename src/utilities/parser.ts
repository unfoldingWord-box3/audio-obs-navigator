export function parser(cli: string) {
    let trimmed = cli.replace(/\s+/g, ' ').trim(); // remove extra white space
    let parts = trimmed.split(" "); // tokenize
    let command: string = "c";
    let story: number = 1;
    let frame: number = 1;

    for (var a in parts) {
        switch (parts[a]) {
            case "play":
            case "check": command = "c"; break;
            case "story": story = parseInt(parts[parts.indexOf("story") + 1], 10); break;
            case "frame": frame = parseInt(parts[parts.indexOf("frame") + 1], 10);
        }
    }

    return [command, story, frame];
}


