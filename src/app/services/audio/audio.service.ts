import { Injectable } from '@angular/core';
import {IAudioService} from "./interfaces";

@Injectable({
	providedIn: 'root'
})
export class AudioService implements IAudioService {
	// Notification audio
	private outageAudio: HTMLAudioElement = new Audio();
	public readonly initialized: boolean = false;
	
	constructor() {
		// Initialize Audio
		try {
			this.outageAudio.src = "../../assets/audio/outage.mp3";
			this.outageAudio.load();
			this.initialized = true;
		} catch (err) {
			console.log('[AudioService]: There was an error initializing the audio.');
			console.log(err);
		}
	}
	
	
	
	/*
	* Plays the outage audio mp3 if the platform is compatible
	* @returns void
	* */
	public async playOutage(): Promise<void> { return this.outageAudio.play() }
}
