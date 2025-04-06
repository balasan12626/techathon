import React, { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { languages } from './languages';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [translated, setTranslated] = useState('');
  const [language, setLanguage] = useState('ta');
  const accessKey = 'fz-0BsdKayAZcaSY-cXzAGY_O1fkNQBaRhO9iub5GeU'; // Replace with your real one


  const mockSuggestions = [
    'Madurai Meenakshi Temple',
    'Brihadeeswarar Temple',
    'Thanjavur Palace',
    'Mahabalipuram',
    'Chidambaram Temple'
  ];

  const getUnsplashImage = async (query) => {
    const UNSPLASH_ACCESS_KEY = 'fz-0BsdKayAZcaSY-cXzAGY_O1fkNQBaRhO9iub5GeU'; // ✅ Use your real key
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
      const data = await res.json();
      return data.results[0]?.urls?.regular || '';
    } catch (error) {
      console.error('Unsplash error:', error);
      return '';
    }
  };
  






  useEffect(() => {
    if (searchQuery.length > 0) {
      setSuggestions(
        mockSuggestions.filter(item =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setShowSuggestions(false);
    setResult(null);
  
    try {
      const response = await fetch('https://techthonbackend.up.railway.app/ASK', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: searchQuery })
      });
  
      if (response.ok) {
        const data = await response.json();
        const imageUrl = await getUnsplashImage(searchQuery); // ✅ added this line
        setResult({
          title: searchQuery,
          description: data.reply || 'No description available.',
          image: imageUrl, // ✅ use this
          latitude: 'N/A',
          longitude: 'N/A'
        });
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        alert('Failed to get data from server.');
      }
    } catch (err) {
      console.error('Network Error:', err);
      alert('Network error. Please  server problem check your connection.');
    }
  
    setIsLoading(false);
  };
  

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setResult(null);
  };

  const translateWithAzure = async () => {
    if (!result?.description) return;

    const response = await fetch('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + language, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'EnxyoAz1kMtZnhBzwsfmTpQjWxiBKeXxbHP7tdTX9yA6pnGoK972JQQJ99BDACGhslBXJ3w3AAAbACOG7V0M',
        'Ocp-Apim-Subscription-Region': 'centralindia',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: result.description }])
    });

    const data = await response.json();
    setTranslated(data[0]?.translations[0]?.text || '');
  };


  const speakText = (translated) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      '7CYOapefQrQ38eXOHBTQKO7F8j9IrXks8aCw77bLBvp22IODqWvvJQQJ99BDACGhslBXJ3w3AAAYACOGNQ5A',
      'centralindia' // e.g., 'centralindia'
    );
  
    // Choose voice (optional)
    speechConfig.speechSynthesisVoiceName = 'ta-IN-PallaviNeural';
  
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
  
    synthesizer.speakTextAsync(
      translated,
      result => {
        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          console.log('Speech synthesized successfully!');
        } else {
          console.error('Speech synthesis failed:', result.errorDetails);
        }
        synthesizer.close();
      },
      error => {
        console.error('Error during speech synthesis:', error);
        synthesizer.close();
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="px-6 py-4 bg-[#1E1E1E] shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:text-[#03dac6]">Home</a></li>
              <li><a href="#" className="hover:text-[#03dac6]">Features</a></li>
              <li><a href="#" className="hover:text-[#03dac6]">About</a></li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-[#424242]">
              <User className="w-6 h-6" />
            </button>
            <button className="px-4 py-2 bg-[#2196f3] rounded-lg hover:bg-[#1976d2]">Login</button>
            <button className="px-4 py-2 border border-[#2196f3] rounded-lg hover:bg-[#2196f3]/10">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#424242]" />
            <input
              type="text"
              placeholder="Search historical places in Tamil Nadu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-12 pr-10 py-4 bg-[#1E1E1E] rounded-lg border border-[#424242] focus:border-[#2196f3]"
            />
            {searchQuery && (
              <button
                onClick={handleClear}
                className="absolute right-4 p-1 rounded-full hover:bg-[#424242]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute w-full mt-2 bg-[#1E1E1E] rounded-lg border border-[#424242] shadow-lg z-10">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                    handleSearch();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#424242]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="mt-4 px-6 py-3 bg-[#2196f3] rounded-lg hover:bg-[#1976d2] w-full"
        >
          Search
        </button>
      </section>

      {/* Results Section */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        {isLoading ? (
          <div className="text-center text-gray-400 text-lg">Loading...</div>
        ) : result ? (
          <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg">
            <img
              src={result.image}
              alt={result.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{result.title}</h3>
              <p className="text-[#BDBDBD] mb-4">{result.description}</p>
              <p className="text-sm text-[#9E9E9E]">
                📍 Latitude: {result.latitude}, Longitude: {result.longitude}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Translation Section */}
      <div className="p-6 text-white bg-[#121212]">
        <h1 className="text-2xl mb-4">Azure Translator Example</h1>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 mb-4 text-black"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <button
          onClick={translateWithAzure}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Translate
        </button>

        {translated && (
          <div className="mt-6 bg-[#1E1E1E] p-4 rounded">
            <strong>Translated:</strong>
            <p>{translated}</p>
          </div>
        )}
      </div>




      <button onClick={() => speakText(translated)}>
  🔊 Speak
</button>

    </div>
  );
}

export default App;
