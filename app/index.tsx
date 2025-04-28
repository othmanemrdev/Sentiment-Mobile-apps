import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ScrollView
} from 'react-native';

// Define types for result object
type ModelResult = {
  logreg: string;
  bayes: string;
  bert: string;
  combined: string;
};

type ResultsState = {
  imdb: ModelResult | null;
  yelp: ModelResult | null;
  amazon: ModelResult | null;
  merged: ModelResult | null;
  all_combined: string | null;
};

export default function App() {
  const [texts, setTexts] = useState({
    imdb: '',
    yelp: '',
    amazon: '',
    merged: '',
    all: ''
  });

  const [results, setResults] = useState<ResultsState>({
    imdb: null,
    yelp: null,
    amazon: null,
    merged: null,
    all_combined: null
  });

  const handlePredict = async (
    text: string,
    endpoint: string,
    platform: keyof ResultsState
  ) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      console.log('API response:', data);
  
      if (platform === 'all_combined') {
        // We received all platforms' predictions (imdb, yelp, amazon, merged)
        setResults(prev => ({
          ...prev,
          imdb: {
            logreg: data.imdb.logreg,
            bayes: data.imdb.bayes,
            bert: data.imdb.bert,
            combined: '' // Optional, you can leave it empty or create your own combined
          },
          yelp: {
            logreg: data.yelp.logreg,
            bayes: data.yelp.bayes,
            bert: data.yelp.bert,
            combined: ''
          },
          amazon: {
            logreg: data.amazon.logreg,
            bayes: data.amazon.bayes,
            bert: data.amazon.bert,
            combined: ''
          },
          merged: {
            logreg: data.merged.logreg,
            bayes: data.merged.bayes,
            bert: data.merged.bert,
            combined: ''
          },
          all_combined: null // Or leave as null
        }));
      } else {
        setResults(prev => ({
          ...prev,
          [platform]: {
            logreg: data.logreg,
            bayes: data.bayes,
            bert: data.bert,
            combined: data.combined
          }
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Sentiment Analysis App by nouhaila & lamya & salma & othmane</Text>

      {(['imdb', 'yelp', 'amazon', 'merged'] as const).map(platform => (
        <View key={platform} style={styles.section}>
          <Text style={styles.title}>{platform.toUpperCase()}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${platform} text`}
            value={texts[platform]}
            onChangeText={text => setTexts({ ...texts, [platform]: text })}
          />
          <Button
            title="Predict"
            onPress={() =>
              handlePredict(texts[platform], `predict-all-${platform}`, platform)
            }
          />
          {results[platform] && (
            <View style={styles.results}>
              <Text>LogReg: {results[platform]?.logreg}</Text>
              <Text>Naive Bayes: {results[platform]?.bayes}</Text>
              <Text>BERT: {results[platform]?.bert}</Text>
              <Text>Combined: {results[platform]?.combined}</Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.title}>ALL Platforms</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter text for all platforms"
          value={texts.all}
          onChangeText={text => setTexts({ ...texts, all: text })}
        />
        <Button
          title="Predict All"
          onPress={() => handlePredict(texts.all, 'predict-all', 'all_combined')}
        />
        {results.all_combined && (
          <Text style={styles.results}>
            Global Combined: {results.all_combined}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  section: {
    marginBottom: 30
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10
  },
  results: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#f0f0f0'
  }
});
