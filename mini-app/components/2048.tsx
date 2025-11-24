"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function getRandomTile() {
  const rand = Math.random();
  return rand < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
}

function cloneGrid(grid: number[][]) {
  return grid.map(row => [...row]);
}

export default function Game2048() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  // Initialize with two tiles
  useEffect(() => {
    addRandomTile();
    addRandomTile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRandomTile = () => {
    const empty: [number, number][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newGrid = cloneGrid(grid);
    newGrid[r][c] = getRandomTile();
    setGrid(newGrid);
  };

  const move = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    let moved = false;
    let newGrid = cloneGrid(grid);
    let newScore = score;

    const combine = (a: number[], b: number[]) => {
      const result = [...a];
      for (let i = 0; i < b.length; i++) {
        if (result[i] === 0) {
          result[i] = b[i];
        } else if (result[i] === b[i]) {
          result[i] *= 2;
          newScore += result[i];
          result[i] = 0;
        } else {
          result[i] = b[i];
        }
      }
      return result;
    };

    const slide = (row: number[]) => {
      const nonZero = row.filter(v => v !== 0);
      const merged = [];
      let i = 0;
      while (i < nonZero.length) {
        if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
          merged.push(nonZero[i] * 2);
          i += 2;
        } else {
          merged.push(nonZero[i]);
          i += 1;
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      return merged;
    };

    const transpose = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]));

    if (dir === "left") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const newRow = slide(newGrid[r]);
        if (!moved && JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
    } else if (dir === "right") {
      for (let r = 0; r < GRID_SIZE; r++) {
        const rev = [...newGrid[r]].reverse();
        const newRow = slide(rev).reverse();
        if (!moved && JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
    } else if (dir === "up") {
      newGrid = transpose(newGrid);
      for (let r = 0; r < GRID_SIZE; r++) {
        const newRow = slide(newGrid[r]);
        if (!moved && JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
      newGrid = transpose(newGrid);
    } else if (dir === "down") {
      newGrid = transpose(newGrid);
      for (let r = 0; r < GRID_SIZE; r++) {
        const rev = [...newGrid[r]].reverse();
        const newRow = slide(rev).reverse();
        if (!moved && JSON.stringify(newRow) !== JSON.stringify(newGrid[r])) moved = true;
        newGrid[r] = newRow;
      }
      newGrid = transpose(newGrid);
    }

    if (moved) {
      setGrid(newGrid);
      setScore(newScore);
      if (newGrid.flat().includes(2048)) setWon(true);
      addRandomTile();
      if (!hasMoves(newGrid)) setGameOver(true);
    }
  };

  const hasMoves = (g: number[][]) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c] === 0) return true;
        if (c + 1 < GRID_SIZE && g[r][c] === g[r][c + 1]) return true;
        if (r + 1 < GRID_SIZE && g[r][c] === g[r + 1][c]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") move("up");
      if (e.key === "ArrowDown") move("down");
      if (e.key === "ArrowLeft") move("left");
      if (e.key === "ArrowRight") move("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [grid, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((val, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-16 w-16 rounded-md text-xl font-bold ${
              val === 0
                ? "bg-gray-200"
                : val <= 4
                ? "bg-yellow-200"
                : val <= 8
                ? "bg-yellow-300"
                : val <= 16
                ? "bg-yellow-400"
                : val <= 32
                ? "bg-yellow-500"
                : val <= 64
                ? "bg-yellow-600"
                : val <= 128
                ? "bg-yellow-700"
                : val <= 256
                ? "bg-yellow-800"
                : val <= 512
                ? "bg-yellow-900"
                : "bg-red-500"
            }`}
          >
            {val !== 0 ? val : null}
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <Button onClick={() => move("up")}>↑</Button>
        <Button onClick={() => move("down")}>↓</Button>
        <Button onClick={() => move("left")}>←</Button>
        <Button onClick={() => move("right")}>→</Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-lg">Score: {score}</span>
        {gameOver && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-semibold">
              {won ? "You won!" : "Game Over"}
            </span>
            <Share text={`I scored ${score} points in 2048! ${url}`} />
          </div>
        )}
      </div>
    </div>
  );
}
