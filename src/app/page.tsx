'use client';

import {
  GENERATIONS,
  type Generation,
  type Pokemon,
  getPokemonJapaneseName,
  normalizePokemonName,
} from '@/utils/pokemon';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [inputName, setInputName] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [maxCorrectCount, setMaxCorrectCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [remainingPokemonIds, setRemainingPokemonIds] = useState<number[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation>(
    GENERATIONS[0],
  );

  const initializePokemonIds = (generation: Generation) => {
    const ids = Array.from(
      { length: generation.endId - generation.startId + 1 },
      (_, i) => i + generation.startId,
    );
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  };

  const startGame = async (generation: Generation) => {
    setIsPlaying(true);
    setSelectedGeneration(generation);
    setCorrectCount(0);
    const newIds = initializePokemonIds(generation);
    setRemainingPokemonIds(newIds);
    const pokemonId = newIds[0];
    await fetchPokemonById(pokemonId);
    setRemainingPokemonIds(newIds.slice(1));
  };

  const fetchNewPokemon = async () => {
    if (remainingPokemonIds.length === 0) {
      const newIds = initializePokemonIds(selectedGeneration);
      setRemainingPokemonIds(newIds);
      const pokemonId = newIds[0];
      await fetchPokemonById(pokemonId);
      setRemainingPokemonIds(newIds.slice(1));
      return;
    }

    const pokemonId = remainingPokemonIds[0];
    await fetchPokemonById(pokemonId);
    setRemainingPokemonIds((prev) => prev.slice(1));
  };

  const fetchPokemonById = async (pokemonId: number) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
      );
      const data = (await response.json()) as {
        id: number;
        name: string;
        sprites: {
          front_default: string;
        };
      };
      const japaneseName = await getPokemonJapaneseName(data.name);

      const newPokemon: Pokemon = {
        id: data.id,
        name: data.name,
        japaneseName: japaneseName,
        image: data.sprites.front_default,
      };

      setPokemon(newPokemon);
    } catch (error) {
      console.error('ポケモンのデータを取得できませんでした。', error);
      setPokemon(null);
    }

    setInputName('');
    setShowAnswer(false);
    setIsCorrect(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemon) return;

    const normalizedInput = normalizePokemonName(inputName);
    const normalizedCorrect = normalizePokemonName(pokemon.japaneseName);

    const isAnswerCorrect = normalizedInput === normalizedCorrect;
    setIsCorrect(isAnswerCorrect);
    setShowAnswer(true);

    if (isAnswerCorrect) {
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      setMaxCorrectCount(Math.max(maxCorrectCount, newCount));
      setTimeout(() => {
        fetchNewPokemon();
      }, 1000);
    }
  };

  const handleRetry = async () => {
    setCorrectCount(0);
    setRemainingPokemonIds(initializePokemonIds(selectedGeneration));
    await fetchNewPokemon();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>ポケモンクイズ</h1>

        {!isPlaying ? (
          <div className={styles.startContainer}>
            <h2 className={styles.subtitle}>世代を選択してください</h2>
            <div className={styles.generationGrid}>
              {GENERATIONS.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => startGame(gen)}
                  className={styles.generationButton}
                >
                  {gen.name}
                  <span className={styles.pokemonCount}>
                    (No.{gen.startId}～{gen.endId})
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.scores}>
              <p>現在の連続正解数: {correctCount}</p>
              <p>最大連続正解数: {maxCorrectCount}</p>
            </div>

            {pokemon && (
              <div className={styles.gameArea}>
                {showAnswer && (
                  <div className={styles.pokemonInfo}>
                    <p>図鑑No.{pokemon.id}</p>
                    <p>正解: {pokemon.japaneseName}</p>
                  </div>
                )}

                <img
                  src={pokemon.image}
                  alt="Who's that Pokemon?"
                  className={styles.pokemonImage}
                />

                {showAnswer && (
                  <div className={styles.result}>
                    {isCorrect ? (
                      <span className={styles.correct}>⭕️</span>
                    ) : (
                      <span className={styles.incorrect}>❌</span>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="ポケモンの名前を入力"
                    className={styles.input}
                    disabled={showAnswer}
                    data-1p-ignore
                    autoComplete="off"
                  />
                  {!showAnswer ? (
                    <button type="submit" className={styles.button}>
                      送信
                    </button>
                  ) : !isCorrect ? (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className={styles.retryButton}
                    >
                      リトライ
                    </button>
                  ) : null}
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
