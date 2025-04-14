import React, { useState, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationBar from '@/components/NavigationBar';
import MobileFooter from '@/components/MobileFooter';
import FloatingMusicNotes from '@/components/FloatingMusicNotes';
import { Play, Pause, Plus, Minus, Music, Volume2, Volume1, VolumeX } from 'lucide-react';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [volume, setVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const primaryClickRef = useRef<AudioBuffer | null>(null);
  const secondaryClickRef = useRef<AudioBuffer | null>(null);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Load sounds
    const loadSounds = async () => {
      try {
        // Create a high pitched sound for the primary beat
        const primaryOsc = audioContext.current!.createOscillator();
        primaryOsc.frequency.value = 1600; // higher pitch for primary beat
        const primaryGain = audioContext.current!.createGain();
        primaryGain.gain.value = 0;
        primaryOsc.connect(primaryGain);
        primaryGain.connect(audioContext.current!.destination);
        
        // Create a buffer for the primary click
        const primaryBuffer = audioContext.current!.createBuffer(1, audioContext.current!.sampleRate * 0.1, audioContext.current!.sampleRate);
        const primaryData = primaryBuffer.getChannelData(0);
        for (let i = 0; i < primaryData.length; i++) {
          primaryData[i] = Math.sin(i * 0.05) * Math.exp(-i / (primaryData.length / 8));
        }
        primaryClickRef.current = primaryBuffer;
        
        // Create a lower pitched sound for secondary beats
        const secondaryOsc = audioContext.current!.createOscillator();
        secondaryOsc.frequency.value = 800; // lower pitch for secondary beats
        const secondaryGain = audioContext.current!.createGain();
        secondaryGain.gain.value = 0;
        secondaryOsc.connect(secondaryGain);
        secondaryGain.connect(audioContext.current!.destination);
        
        // Create a buffer for the secondary click
        const secondaryBuffer = audioContext.current!.createBuffer(1, audioContext.current!.sampleRate * 0.1, audioContext.current!.sampleRate);
        const secondaryData = secondaryBuffer.getChannelData(0);
        for (let i = 0; i < secondaryData.length; i++) {
          secondaryData[i] = Math.sin(i * 0.03) * Math.exp(-i / (secondaryData.length / 8));
        }
        secondaryClickRef.current = secondaryBuffer;
      } catch (error) {
        console.error('Error loading metronome sounds:', error);
      }
    };
    
    loadSounds();
    
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Play sound based on beat
  const playClick = () => {
    if (audioContext.current && !isMuted) {
      const source = audioContext.current.createBufferSource();
      const gainNode = audioContext.current.createGain();
      
      // Set the volume
      gainNode.gain.value = volume / 100;
      source.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      // Use different sounds for primary and secondary beats
      if (currentBeat === 0) {
        source.buffer = primaryClickRef.current;
      } else {
        source.buffer = secondaryClickRef.current;
      }
      
      source.start();
    }
    
    // Update current beat
    setCurrentBeat((currentBeat + 1) % beatsPerMeasure);
  };

  // Start/stop metronome
  useEffect(() => {
    if (isPlaying) {
      const intervalTime = (60 / bpm) * 1000;
      
      if (audioContext.current?.state === 'suspended') {
        audioContext.current.resume();
      }
      
      timerRef.current = window.setInterval(playClick, intervalTime);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, bpm, beatsPerMeasure, currentBeat, volume, isMuted]);

  // Handle BPM change
  const handleBpmChange = (value: number[]) => {
    const newBpm = value[0];
    setBpm(newBpm);
    
    // Restart interval with new BPM if currently playing
    if (isPlaying && timerRef.current !== null) {
      clearInterval(timerRef.current);
      const intervalTime = (60 / newBpm) * 1000;
      timerRef.current = window.setInterval(playClick, intervalTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Increment/decrement BPM
  const adjustBpm = (amount: number) => {
    const newBpm = Math.max(20, Math.min(240, bpm + amount));
    setBpm(newBpm);
  };

  // Increment/decrement beats per measure
  const adjustBeatsPerMeasure = (amount: number) => {
    const newBeats = Math.max(1, Math.min(12, beatsPerMeasure + amount));
    setBeatsPerMeasure(newBeats);
    // Reset current beat if reducing total beats
    if (currentBeat >= newBeats) {
      setCurrentBeat(0);
    }
  };

  // Get the volume icon based on current volume
  const getVolumeIcon = () => {
    if (isMuted) return <VolumeX />;
    if (volume > 50) return <Volume2 />;
    if (volume > 0) return <Volume1 />;
    return <VolumeX />;
  };

  return (
    <>
      <NavigationBar />
      <FloatingMusicNotes />
      
      <main className="container mx-auto px-4 py-6 wave-bg pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-dark-slate mb-6">
            Metronome
          </h1>
          <p className="text-dark-slate/70 mb-6">
            Use this metronome to practice your timing and rhythm. Adjust the tempo (BPM) and beats per measure to match your practice needs.
          </p>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-center text-royal-purple">
                {bpm} BPM
              </CardTitle>
              <CardDescription className="text-center">
                {beatsPerMeasure} beats per measure
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Visualization of beats */}
              <div className="flex justify-center items-center gap-2 my-6">
                {Array.from({ length: beatsPerMeasure }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-6 w-6 rounded-full transition-all duration-200 ${
                      isPlaying && currentBeat === index
                        ? index === 0
                          ? 'bg-royal-purple scale-125'
                          : 'bg-turmeric-yellow scale-110'
                        : index === 0
                          ? 'bg-royal-purple/40'
                          : 'bg-turmeric-yellow/40'
                    }`}
                  ></div>
                ))}
              </div>
              
              {/* BPM controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tempo (BPM)</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustBpm(-1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      className="w-16 h-8 text-center"
                      min={20}
                      max={240}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustBpm(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  defaultValue={[bpm]}
                  value={[bpm]}
                  min={20}
                  max={240}
                  step={1}
                  onValueChange={handleBpmChange}
                  className="z-10"
                />
                <div className="flex justify-between text-xs text-dark-slate/60">
                  <span>20</span>
                  <span>Largo</span>
                  <span>Andante</span>
                  <span>Allegro</span>
                  <span>Presto</span>
                  <span>240</span>
                </div>
              </div>
              
              {/* Beats per measure controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Beats per measure</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustBeatsPerMeasure(-1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={beatsPerMeasure}
                      onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
                      className="w-16 h-8 text-center"
                      min={1}
                      max={12}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => adjustBeatsPerMeasure(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Volume control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Volume</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleMute}
                  >
                    {getVolumeIcon()}
                  </Button>
                </div>
                <Slider
                  defaultValue={[volume]}
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  disabled={isMuted}
                  onValueChange={handleVolumeChange}
                  className={isMuted ? "opacity-50" : ""}
                />
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 pb-6">
              <Button
                className={`w-full text-lg py-6 ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-royal-purple hover:bg-royal-purple/90'
                }`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Metronome tips */}
          <div className="mt-8 bg-white/60 p-6 rounded-lg shadow-sm">
            <h2 className="font-bold text-xl mb-3 flex items-center">
              <Music className="mr-2 h-5 w-5 text-royal-purple" />
              Practice Tips
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-dark-slate/80">
              <li>Start at a slower tempo and gradually increase speed as you build consistency.</li>
              <li>Practice subdivisions by thinking or playing eighth or sixteenth notes between beats.</li>
              <li>Focus on maintaining consistent breath support with the metronome's tempo.</li>
              <li>For compound meters, set the metronome to count dotted quarter notes (e.g., 40-60 BPM for 6/8 time).</li>
              <li>To work on phrasing, set the metronome to mark only the first beat of the measure.</li>
            </ul>
          </div>
        </div>
      </main>
      
      <MobileFooter />
    </>
  );
};

export default Metronome;