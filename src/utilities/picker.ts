import { parser } from "../utilities/parser";

export function picker(speech: string) {  // construct url to OBS frame clip
    var [cmd, story, frame] = parser("check story 1 frame 2" + speech);
    //  "en/en-obs-v6/en_obs_02-05_128kbps.mp3"
    const lang = "en/en";
    const domain = "https://cdn.door43.org/obs/mp3/1/";
    const scope = ("0" + story).slice(-2) + "_" + ("0" + frame).slice(-2);
    return domain + lang + "_obs_" + scope + "_128kbps.mp3";
}
