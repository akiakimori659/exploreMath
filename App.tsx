import React, { useState, useEffect, useRef } from 'react';
import { generateLesson, generateChatResponse, generateQuiz, gradeQuizAnswers } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';

// --- Configuration ---
// GitHubリポジトリのURLをここに設定してください
const GITHUB_REPO_URL = "https://github.com"; 

// --- Icons ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const ChevronUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
);
const ShopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
);
const MissionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const EraserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 18 1-9 6 3 6-3 1 9H5Z"/><path d="M12 9V5"/></svg>
);
const ExamIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);
const CoinsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
);
const CoffeeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
);
const ExchangeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
);

// --- Constants ---

const DRILL_LP_RATES = {
    add: 10, sub: 10, mul: 10, div: 10,
    exp: 20, root: 20
};

const COUNT_MULTIPLIERS = {
    10: 1, 25: 3, 50: 7
};

const DIFFICULTY_MULTIPLIERS = {
    easy: 0.75,
    normal: 1.0,
    hard: 1.5
};

const EXAM_REWARDS = {
    basic: 5,
    applied: 10,
    advanced: 15
};

const BASE_PRODUCTS = [
    {
        id: 'math-grade1-vol1',
        title: 'はじめての算数 上',
        type: 'book',
        description: '小学校一年生の算数の内容をわかりやすく解説する参考書です。',
        price: 100,
        category: '小学1年生',
        units: [
            { id: '1-1', title: 'たしざん' },
            { id: '1-2', title: 'ひきざん' },
            { id: '1-3', title: 'かたちあそび (りったい)' },
            { id: '1-4', title: 'とけい' },
            { id: '1-5', title: 'どちらが おおい' },
            { id: '1-6', title: '100までの かず' },
            { id: '1-7', title: 'かたちづくり (へいめん)' },
            { id: '1-8', title: 'どんな しきに なるかな' },
            { id: '1-9', title: 'おなじ かずずつ わけよう' },
        ]
    },
    {
        id: 'math-grade2-vol1',
        title: 'はじめての算数 下',
        type: 'book',
        description: '小学校二年生の算数の内容をわかりやすく解説する参考書です。',
        price: 100,
        category: '小学2年生',
        units: [
            { id: '2-1', title: '表とグラフ' },
            { id: '2-2', title: '時こくと時間' },
            { id: '2-3', title: 'たし算のひっ算' },
            { id: '2-4', title: 'ひき算のひっ算' },
            { id: '2-5', title: '長さ（cm、mm）' },
            { id: '2-6', title: '1000までの数' },
            { id: '2-7', title: 'かさ（L、dL、mL）' },
            { id: '2-8', title: 'たし算とひき算（図を使って考える問題）' },
            { id: '2-9', title: 'かけ算（九九）' },
            { id: '2-10', title: '三角形と四角形' },
            { id: '2-11', title: '10000までの数' },
            { id: '2-12', title: '長い長さ（m）' },
            { id: '2-13', title: '分数（基礎）' },
            { id: '2-14', title: 'はこの形' },
        ]
    },
    {
        id: 'math-grade3-vol1',
        title: '楽しい算数 上',
        type: 'book',
        description: '小学校三年生の算数の内容を楽しく解説する参考書です。',
        price: 500,
        category: '小学3年生',
        units: [
            { id: '3-1', title: '九九の表と図' },
            { id: '3-2', title: '時こくと時間（時間の計算）' },
            { id: '3-3', title: 'わり算（はじめてのわり算）' },
            { id: '3-4', title: 'たし算とひき算の筆算（3けた・4けた）' },
            { id: '3-5', title: '長いものの長さ（km、まきじゃく）' },
            { id: '3-6', title: 'あまりのあるわり算' },
            { id: '3-7', title: '一万をこえる数（大きな数）' },
            { id: '3-8', title: 'かけ算の筆算 (1)（何十をかける計算）' },
            { id: '3-9', title: '円と球' },
            { id: '3-10', title: '小数（0.1の位）' },
            { id: '3-11', title: '重さ（g、kg、はかり）' },
            { id: '3-12', title: '分数（分母が同じ加減）' },
            { id: '3-13', title: '□を使った式' },
            { id: '3-14', title: 'かけ算の筆算 (2)（2けた×2けた）' },
            { id: '3-15', title: '三角形（二等辺三角形・正三角形・角）' },
            { id: '3-16', title: '棒グラフと表' },
            { id: '3-17', title: 'そろばん' },
        ]
    },
    {
        id: 'math-grade4-vol1',
        title: '楽しい算数 下',
        type: 'book',
        description: '小学校四年生の算数の内容を深く解説する参考書です。',
        price: 500,
        category: '小学4年生',
        units: [
            { id: '4-1', title: '大きな数（億、兆）' },
            { id: '4-2', title: 'グラフ（折れ線グラフ）' },
            { id: '4-3', title: 'わり算の筆算 (1)（2けた÷1けた）' },
            { id: '4-4', title: '角（分度器の使い方）' },
            { id: '4-5', title: 'わり算の筆算 (2)（2けた÷2けた、3けた÷2けた）' },
            { id: '4-6', title: '垂直・平行と四角形（台形・平行四辺形・ひし形）' },
            { id: '4-7', title: 'そろばん' },
            { id: '4-8', title: '小数（小数の仕組み、たし算・ひき算）' },
            { id: '4-9', title: '式と計算の順序（カッコのある計算など）' },
            { id: '4-10', title: '面積（平方センチメートル、平方メートル、アール、ヘクタール）' },
            { id: '4-11', title: '小数の乗法・除法（小数×整数、小数÷整数）' },
            { id: '4-12', title: '変わり方（表を使って関係を調べる）' },
            { id: '4-13', title: '分数（真分数、仮分数、帯分数）' },
            { id: '4-14', title: '直方体と立方体（展開図、位置の表し方）' },
        ]
    },
    {
        id: 'math-grade5-vol1',
        title: '面白い算数 上',
        type: 'book',
        description: '小学校五年生の算数。語彙が難しくなり、抽象的な思考が求められます。',
        price: 750,
        category: '小学5年生',
        units: [
            { id: '5-1', title: '整数と小数の仕組み' },
            { id: '5-2', title: '体積（直方体・立方体・複雑な形）' },
            { id: '5-3', title: '比例（変わり方）' },
            { id: '5-4', title: '小数のかけ算（小数×小数）' },
            { id: '5-5', title: '小数のわり算（小数÷小数）' },
            { id: '5-6', title: '合同な図形' },
            { id: '5-7', title: '図形の角（三角形・四角形の内角の和）' },
            { id: '5-8', title: '偶数と奇数、倍数と約数' },
            { id: '5-9', title: '分数（通分・約分、異分母のたし算・ひき算）' },
            { id: '5-10', title: '平均' },
            { id: '5-11', title: '単位量あたりの大きさ（密度・速さの基礎）' },
            { id: '5-12', title: '図形の面積（平行四辺形・三角形・台形・ひし形）' },
            { id: '5-13', title: '正多角形と円周（円周率）' },
            { id: '5-14', title: '百分率とグラフ（％、帯グラフ・円グラフ）' },
            { id: '5-15', title: '角柱と円柱' },
        ]
    },
    {
        id: 'math-grade6-vol1',
        title: '面白い算数 下',
        type: 'book',
        description: '小学校六年生の算数。中学校への架け橋となる重要な単元を学びます。',
        price: 750,
        category: '小学6年生',
        units: [
            { id: '6-1', title: '対称な図形（線対称・点対称）' },
            { id: '6-2', title: '文字と式（xやyを使った式）' },
            { id: '6-3', title: '分数のかけ算' },
            { id: '6-4', title: '分数のわり算' },
            { id: '6-5', title: '比（比の等しさ、比の値）' },
            { id: '6-6', title: '拡大図と縮図' },
            { id: '6-7', title: '円の面積' },
            { id: '6-8', title: '角柱と円柱の体積' },
            { id: '6-9', title: 'およその面積と体積' },
            { id: '6-10', title: '並べ方と組み合わせ（場合の数）' },
            { id: '6-11', title: 'データの活用（平均値、中央値、最頻値、ドットプロット）' },
            { id: '6-12', title: '算数のまとめ（小学校6年間の総復習）' },
        ]
    },
    {
        id: 'math-elem-review',
        title: '小学校 重要単元13選',
        type: 'book',
        description: '小学校の算数で特につまずきやすい重要な13単元を厳選。6年生の総復習に最適です。',
        price: 800,
        category: '小学6年生（総復習）',
        units: [
            { id: 'R-1', title: 'くり上がり・くり下がりの計算（1年）' },
            { id: 'R-2', title: 'かけ算九九（2年）' },
            { id: 'R-3', title: '時こくと時間（2・3年）' },
            { id: 'R-4', title: 'わり算の基礎とあまり（3年）' },
            { id: 'R-5', title: '小数・分数の仕組み（3年）' },
            { id: 'R-6', title: '2けたでわるわり算の筆算（4年）' },
            { id: 'R-7', title: '面積の公式と単位（4・5年）' },
            { id: 'R-8', title: '分数の通分・約分と四則計算（5・6年）' },
            { id: 'R-9', title: '単位量あたりの大きさ（5年）' },
            { id: 'R-10', title: '割合（％、歩合）（5年）' },
            { id: 'R-11', title: '速さ（6年）' },
            { id: 'R-12', title: '比（6年）' },
            { id: 'R-13', title: '文字と式（x の使用）（6年）' },
        ]
    },
    {
        id: 'math-jhs-grade1',
        title: '中学数学 上',
        type: 'book',
        description: '中学校一年生の数学。算数から数学へ。正の数・負の数や方程式など、新しい概念が一気に登場します。',
        price: 1000,
        category: '中学1年生',
        units: [
            { id: 'J1-1', title: '正の数・負の数（マイナスの概念、絶対値、四則計算）' },
            { id: 'J1-2', title: '文字の式（式の表し方、代入、文字式の計算）' },
            { id: 'J1-3', title: '一元一次方程式（方程式の解き方、利用・文章題）' },
            { id: 'J1-4', title: '変化と対応（比例・反比例）（座標、グラフ、式の求め方）' },
            { id: 'J1-5', title: '平面図形（直線と角、図形の移動、作図、円と扇形）' },
            { id: 'J1-6', title: '空間図形（直線や平面の位置関係、立体の表面積・体積）' },
            { id: 'J1-7', title: 'データの活用（近似値、誤差、度数分布、相対度数、累積度数）' },
        ]
    },
    {
        id: 'math-jhs-grade2',
        title: '中学数学 中',
        type: 'book',
        description: '中学校二年生の数学。連立方程式や証明問題など、論理的な思考力がより一層求められます。',
        price: 1250,
        category: '中学2年生',
        units: [
            { id: 'J2-1', title: '式の計算（単項式と多項式、文字式の加法・減法、乗法・除法、文字式の利用）' },
            { id: 'J2-2', title: '連立二元一次方程式（連立方程式）（解き方、代入法・加減法、連立方程式の利用）' },
            { id: 'J2-3', title: '一次関数（変化の割合、グラフ、一次関数の式の求め方、二元一次方程式とグラフ）' },
            { id: 'J2-4', title: '図形の性質（平行と合同）（平行線と角、多角形の角、三角形の合同条件、証明の進め方）' },
            { id: 'J2-5', title: '図形の性質（三角形と四角形）（二等辺三角形、直角三角形、平行四辺形の性質・条件）' },
            { id: 'J2-6', title: 'データの活用（確率）（場合の数、確率の求め方）' },
            { id: 'J2-7', title: 'データの活用（箱ひげ図）（四分位数、箱ひげ図の書き方と読み取り）' },
        ]
    },
    {
        id: 'math-jhs-grade3',
        title: '中学数学 下',
        type: 'book',
        description: '中学校三年生の数学。因数分解、平方根、二次関数など、高校入試に向けた高度な内容を学びます。',
        price: 1500,
        category: '中学3年生',
        units: [
            { id: 'J3-1', title: '式の展開と因数分解（展開公式、共通因数、因数分解の活用）' },
            { id: 'J3-2', title: '平方根（ルートの概念、根号を含む式の計算、有理化）' },
            { id: 'J3-3', title: '二次方程式（因数分解や解の公式による解法、方程式の利用）' },
            { id: 'J3-4', title: '関数 y=ax^2（二次関数）（グラフの性質、変化の割合、平均の速さ）' },
            { id: 'J3-5', title: '図形の性質と相似（相似条件、縮尺、平行線と線分の比）' },
            { id: 'J3-6', title: '円の性質（円周角の定理）（円周角と中心角、定理の逆）' },
            { id: 'J3-7', title: '三平方の定理（ピタゴラスの定理）（直角三角形の辺の計算、平面・空間図形への応用）' },
            { id: 'J3-8', title: '標本調査（全数調査と標本調査、推定）' },
        ]
    },
    {
        id: 'math-jhs-important11',
        title: '中学数学 重要単元11選',
        type: 'book',
        description: '中学数学の3年間で特に重要な11単元を厳選。高校入試対策や総復習に最適です。',
        price: 1750,
        category: '中学数学（総復習）',
        units: [
            { id: 'J-Imp-1', title: '正の数・負の数（全ての計算の基礎）' },
            { id: 'J-Imp-2', title: '文字の式・式の計算（数学の言語）' },
            { id: 'J-Imp-3', title: '一次方程式・連立方程式・二次方程式（問題を解く主要な道具）' },
            { id: 'J-Imp-4', title: '一次関数（関数の考え方の中心）' },
            { id: 'J-Imp-5', title: '関数 y=ax^2（高校数学の二次関数へ直結）' },
            { id: 'J-Imp-6', title: '三角形の合同と証明（論理的思考の訓練）' },
            { id: 'J-Imp-7', title: '展開と因数分解（計算を簡略化する必須技術）' },
            { id: 'J-Imp-8', title: '平方根（無理数の理解）' },
            { id: 'J-Imp-9', title: '図形の相似（図形問題の最頻出単元）' },
            { id: 'J-Imp-10', title: '三平方の定理（長さを求める最強の定理）' },
            { id: 'J-Imp-11', title: '確率・箱ひげ図（近年入試で配点が増加中）' },
        ]
    },
    {
        id: 'math-hs-1a-set',
        title: '高校数学 I・A セット',
        type: 'book',
        description: '高校数学の基礎となる数学Iと数学Aのセット。数と式、図形、データ分析、確率など幅広い分野を学びます。',
        price: 1500,
        category: '高校数学',
        units: [
            { id: 'HS1-1', title: '【数I】数と式' },
            { id: 'HS1-2', title: '【数I】図形と計量' },
            { id: 'HS1-3', title: '【数I】二次関数' },
            { id: 'HS1-4', title: '【数I】データの分析' },
            { id: 'HSA-1', title: '【数A】図形の性質' },
            { id: 'HSA-2', title: '【数A】場合の数と確率' },
            { id: 'HSA-3', title: '【数A】数学と人間の活動' },
        ]
    },
    {
        id: 'math-hs-2b-set',
        title: '高校数学 II・B セット',
        type: 'book',
        description: '数学I・Aを発展させた内容。微積分、ベクトル、数列など、理系・文系問わず重要な概念が登場します。',
        price: 1750,
        category: '高校数学',
        units: [
            { id: 'HS2-1', title: '【数II】数と式・複素数と方程式' },
            { id: 'HS2-2', title: '【数II】図形と方程式' },
            { id: 'HS2-3', title: '【数II】指数関数・対数関数' },
            { id: 'HS2-4', title: '【数II】三角関数' },
            { id: 'HS2-5', title: '【数II】微分・積分の考え' },
            { id: 'HSB-1', title: '【数B】数列' },
            { id: 'HSB-2', title: '【数B】統計的な推測' },
            { id: 'HSB-3', title: '【数B】数学と社会生活' },
        ]
    },
    {
        id: 'math-hs-3c-set',
        title: '高校数学 III・C セット',
        type: 'book',
        description: '理系数学の集大成。極限、高度な微積分、複素数平面など、大学数学へ繋がる高度な理論を学びます。',
        price: 2000,
        category: '高校数学',
        units: [
            { id: 'HS3-1', title: '【数III】極限' },
            { id: 'HS3-2', title: '【数III】微分法' },
            { id: 'HS3-3', title: '【数III】積分法' },
            { id: 'HSC-1', title: '【数C】ベクトル' },
            { id: 'HSC-2', title: '【数C】平面上の曲線と複素数平面' },
            { id: 'HSC-3', title: '【数C】数学的な表現の工夫' },
        ]
    },
    {
        id: 'math-hs-review',
        title: '高校数学 総復習',
        type: 'book',
        description: '大学入試で配点の高い重要単元を厳選。文系・理系問わず、得点源となる分野を徹底的に強化します。',
        price: 1600,
        category: '高校数学（総復習）',
        units: [
            { id: 'HS-Rev-1', title: '微分・積分（数学II）：入試配点が最も高い。' },
            { id: 'HS-Rev-2', title: 'ベクトル（数学C）：図形問題の必須ツール。' },
            { id: 'HS-Rev-3', title: '数列（数学B）：論理的思考の核。' },
            { id: 'HS-Rev-4', title: '確率（数学A）：共通テスト・二次試験ともに頻出。' },
            { id: 'HS-Rev-5', title: '微分・積分（数学III）：理系入試の最頻出項目。' },
            { id: 'HS-Rev-6', title: '複素数平面（数学C）：難関大で必須。' },
            { id: 'HS-Rev-7', title: '二次関数（数学I）：全ての関数の基礎。' },
            { id: 'HS-Rev-8', title: '三角・指数・対数関数（数学II）：計算の前提知識。' },
        ]
    },
    {
        id: 'math-univ-analysis',
        title: '究極の解析学',
        type: 'book',
        description: '微積分から関数解析まで。現代数学の言語である解析学の深淵へ。',
        price: 2500,
        category: '大学数学',
        units: [
            { id: 'U-AN-1', title: '微分積分学（多変数関数の微積分、重積分、級数）' },
            { id: 'U-AN-2', title: '複素解析学（複素関数、正則関数、留数定理）' },
            { id: 'U-AN-3', title: '微分方程式（常微分方程式、偏微分方程式、解の存在と一意性）' },
            { id: 'U-AN-4', title: '実解析学（ルベーグ積分、測度論、Lp空間）' },
            { id: 'U-AN-5', title: '関数解析学（バナッハ空間、ヒルベルト空間、線形作用素）' },
        ]
    },
    {
        id: 'math-univ-algebra',
        title: '究極の代数学',
        type: 'book',
        description: '数と構造の美しき世界。抽象代数学の諸分野を網羅。',
        price: 2500,
        category: '大学数学',
        units: [
            { id: 'U-AL-1', title: '線形代数学（ベクトル空間、線形写像、固有値、対角化、ジョルダン標準形）' },
            { id: 'U-AL-2', title: '群論（対称性、部分群、商群、群作用）' },
            { id: 'U-AL-3', title: '環論・体論（イデアル、多項式環、ガロア理論）' },
            { id: 'U-AL-4', title: '代数幾何学（代数多様体、スキーム論）' },
            { id: 'U-AL-5', title: '数論（代数的整数論、ゼータ関数）' },
        ]
    },
    {
        id: 'math-univ-geometry',
        title: '究極の幾何学',
        type: 'book',
        description: '図形と空間の本質。直感を超えた形状の理論。',
        price: 2500,
        category: '大学数学',
        units: [
            { id: 'U-GE-1', title: '集合と位相（位相空間、開集合・閉集合、コンパクト性、連結性）' },
            { id: 'U-GE-2', title: '微分幾何学（曲線・曲面論、リーマン幾何学）' },
            { id: 'U-GE-3', title: '多様体論（接空間、微分形式、ストークスの定理）' },
            { id: 'U-GE-4', title: 'トポロジー（基本群、ホモロジー、ホモトピー）' },
        ]
    },
    {
        id: 'math-univ-applied-set',
        title: '究極の応用数学 3冊セット',
        type: 'book',
        description: '確率・統計・応用数学。社会現象を記述する強力な数学ツール群。',
        price: 2500,
        category: '大学数学',
        units: [
            { id: 'U-AP-1', title: '確率論（確率空間、確率変数、大数の法則、中心極限定理）' },
            { id: 'U-AP-2', title: '数理統計学（推定、検定、最尤法）' },
            { id: 'U-AP-3', title: '数値解析（計算アルゴリズム、誤差解析）' },
            { id: 'U-AP-4', title: '離散数学（グラフ理論、組み合わせ論）' },
        ]
    },
    {
        id: 'math-univ-logic',
        title: '究極の数理論理学',
        type: 'book',
        description: '数学そのものを研究対象とする、数学の基礎と論理の探求。',
        price: 2250,
        category: '大学数学',
        units: [
            { id: 'U-LG-1', title: '数学序論（論理記号、集合論の公理、写像）' },
            { id: 'U-LG-2', title: '数理論理学（形式体系、不完全性定理）' },
        ]
    }
];

const LC_PRODUCTS = [
    {
        id: 'ent-paradox',
        title: '数学のパラドックス',
        type: 'book',
        description: 'アキレスと亀、モンティ・ホール問題など、直感に反する数学のパラドックスを楽しみましょう。',
        price: 5,
        category: '娯楽・読み物',
        units: [
            { id: 'ent-1-1', title: '無限のホテル' },
            { id: 'ent-1-2', title: 'アキレスと亀' },
            { id: 'ent-1-3', title: 'モンティ・ホール問題' }
        ]
    },
    {
        id: 'ent-prime',
        title: '素数のミステリー',
        type: 'book',
        description: '数学者たちを何世紀にもわたって魅了し続ける「数の中の宝石」素数の謎に迫ります。',
        price: 10,
        category: '娯楽・読み物',
        units: [
            { id: 'ent-2-1', title: '素数とは何か' },
            { id: 'ent-2-2', title: 'リーマン予想への招待' },
            { id: 'ent-2-3', title: '暗号と素数' }
        ]
    },
    {
        id: 'ent-infinity',
        title: '無限の迷宮',
        type: 'book',
        description: 'カントールの集合論から始まる、めくるめく無限の世界。',
        price: 15,
        category: '娯楽・読み物',
        units: [
            { id: 'ent-3-1', title: '無限にも大きさがある？' },
            { id: 'ent-3-2', title: 'ヒルベルトのプログラム' },
            { id: 'ent-3-3', title: 'ゲーデルの不完全性定理' }
        ]
    }
];

// Generate Workbook variants for all books
const PRODUCTS = [
    ...BASE_PRODUCTS.map(p => ({...p, type: 'book'})),
    ...BASE_PRODUCTS.map(p => ({
        ...p,
        id: `${p.id}-workbook`,
        type: 'workbook',
        title: `${p.title}【問題集】`,
        description: `${p.title} に対応する問題集です。基本・応用・発展問題で理解を深めます。`
    })),
    ...LC_PRODUCTS // Add LC products to the global product list for licensing check
];


// --- Helper Functions ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};

const generateQuestions = (settings) => {
    const questions = [];
    const types = settings.types;
    const { difficulty } = settings;
    
    for (let i = 0; i < settings.count; i++) {
        const type = types[i % types.length];
        let qText = "";
        let ans = 0;

        switch (type) {
            case 'add': {
                let min, max;
                if (difficulty === 'easy') { min=1; max=9; }
                else if (difficulty === 'normal') { min=10; max=999; }
                else { min=1000; max=9999; }

                const a = getRandomInt(min, max);
                const b = getRandomInt(min, max);
                qText = `${a} + ${b}`;
                ans = a + b;
                break;
            }
            case 'sub': {
                let min, max;
                if (difficulty === 'easy') { min=1; max=9; }
                else if (difficulty === 'normal') { min=10; max=999; }
                else { min=1000; max=9999; }

                const a = getRandomInt(min, max);
                const b = getRandomInt(min < 10 ? 1 : 10, a); 
                qText = `${a} - ${b}`;
                ans = a - b;
                break;
            }
            case 'mul': {
                let a, b;
                if (difficulty === 'easy') { 
                    a = getRandomInt(1, 9); 
                    b = getRandomInt(1, 9); 
                } else if (difficulty === 'normal') {
                    a = getRandomInt(10, 99);
                    b = getRandomInt(10, 99);
                } else {
                    a = getRandomInt(100, 999);
                    b = getRandomInt(10, 999);
                }
                qText = `${a} \\; \\times \\; ${b}`; // LaTeX with spacing
                ans = a * b;
                break;
            }
            case 'div': {
                let b, result;
                if (difficulty === 'easy') {
                    b = getRandomInt(2, 9);
                    result = getRandomInt(2, 9);
                } else if (difficulty === 'normal') {
                    b = getRandomInt(2, 20);
                    result = getRandomInt(10, 50);
                } else {
                    b = getRandomInt(10, 99);
                    result = getRandomInt(100, 999);
                }
                const a = b * result;
                qText = `${a} \\; \\div \\; ${b}`; // LaTeX with spacing
                ans = result;
                break;
            }
            case 'exp': {
                let base, exp;
                if (difficulty === 'easy') {
                    base = getRandomInt(2, 9);
                    exp = 2; 
                } else if (difficulty === 'normal') {
                    base = getRandomInt(2, 9);
                    exp = getRandomInt(3, 4);
                } else {
                    base = getRandomInt(10, 20);
                    exp = getRandomInt(3, 5);
                }
                qText = `${base}^{${exp}}`; // LaTeX
                ans = Math.pow(base, exp);
                break;
            }
            case 'root': {
                let base, exp;
                 if (difficulty === 'easy') {
                    base = getRandomInt(2, 9);
                    exp = 2; 
                } else if (difficulty === 'normal') {
                    base = getRandomInt(2, 9);
                    exp = 3; 
                } else {
                    base = getRandomInt(2, 9);
                    exp = 4;
                }
                const num = Math.pow(base, exp);
                qText = exp === 2 ? `\\sqrt{${num}}` : (exp === 3 ? `\\sqrt[3]{${num}}` : `\\sqrt[4]{${num}}`); // LaTeX
                ans = base;
                break;
            }
        }
        questions.push({ id: i, question: qText, answer: ans });
    }
    return questions.sort(() => Math.random() - 0.5);
};

// --- Components ---

// Drawing Canvas Component
const MemoPad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.strokeStyle = '#3b82f6';
                context.lineWidth = 2;
                context.lineCap = 'round';
                setCtx(context);
            }
        }
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        ctx?.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing || !ctx || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return (
        <div className="relative w-full h-40 md:h-64 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden touch-none">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
            />
            <div className="absolute top-2 right-2 flex gap-2">
                 <div className="p-1 bg-white/80 dark:bg-slate-800/80 rounded shadow text-slate-400 pointer-events-none">
                    <PenIcon />
                 </div>
                 <button onClick={clearCanvas} className="p-1 bg-white dark:bg-slate-800 rounded shadow hover:text-red-500 transition-colors z-10">
                    <EraserIcon />
                 </button>
            </div>
            <div className="absolute bottom-2 left-3 text-xs text-slate-300 pointer-events-none select-none">メモ帳</div>
        </div>
    );
};

// --- Helper Components ---
const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 relative ${active ? 'text-accent' : 'text-slate-400'}`}>
        <span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span>
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border">
             <button onClick={onClose} className="absolute top-4 right-4 text-slate-400"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
             {children}
        </div>
    </div>
);

export default function App() {
  // Global App State
  const [activeTab, setActiveTab] = useState('home');
  const [showInfo, setShowInfo] = useState(false);
  
  // Debug State
  const [debugMode, setDebugMode] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  // Persistent State
  const [lp, setLp] = useState(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_lp');
            const parsed = item ? parseInt(item, 10) : 0;
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch { return 0; }
  });

  const [lc, setLc] = useState(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_lc');
            const parsed = item ? parseInt(item, 10) : 0;
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch { return 0; }
  });
  
  const [totalTime, setTotalTime] = useState(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_time');
            const parsed = item ? parseInt(item, 10) : 0;
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    } catch { return 0; }
  });

  const [history, setHistory] = useState(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_history');
            return item ? JSON.parse(item) : [];
        }
        return [];
    } catch { return []; }
  });

  const [ownedLicenses, setOwnedLicenses] = useState(() => {
    try {
        if (typeof window !== 'undefined') {
            const item = localStorage.getItem('mathcore_licenses');
            return item ? JSON.parse(item) : [];
        }
        return [];
    } catch { return []; }
  });

  const [completedUnits, setCompletedUnits] = useState(() => {
      try {
          if (typeof window !== 'undefined') {
              const item = localStorage.getItem('mathcore_completed_units');
              return item ? JSON.parse(item) : [];
          }
          return [];
      } catch { return []; }
  });

  // Derived State for Display (Handles Debug Mode)
  const displayLp = debugMode ? 99999999 : lp;
  const displayLc = debugMode ? 99999 : lc;
  const displayOwnedLicenses = debugMode ? PRODUCTS.map(p => p.id) : ownedLicenses;

  // Home Tab State
  const [lessonState, setLessonState] = useState({
    topic: "",
    category: "",
    content: "",
    isLoading: false,
    error: null,
    isCompleted: false,
  });
  
  // Drill State
  const [drillSettings, setDrillSettings] = useState({
      types: ['add', 'sub', 'mul', 'div'],
      count: 10,
      difficulty: 'normal'
  });
  const [drillStatus, setDrillStatus] = useState('idle');
  const [drillQuestions, setDrillQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [drillInput, setDrillInput] = useState("");
  const [drillScore, setDrillScore] = useState(0);
  const [earnedDrillLP, setEarnedDrillLP] = useState(0);

  // Exam / Workbook State
  const [examState, setExamState] = useState({
      isActive: false,
      isLoading: false,
      mode: 'workbook',
      selectedUnits: [],
      questions: [],
      currentIndex: 0,
      isFinished: false,
      score: 0,
      earnedLp: 0 // New state to track specific LP gain
  });

  // Shop State
  const [shopView, setShopView] = useState('map'); // 'map', 'suurido', 'cafe', 'exchange'
  const [shopFilter, setShopFilter] = useState('all');

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [expandedBooks, setExpandedBooks] = useState({});

  // --- Modal States ---
  const [purchaseModalProduct, setPurchaseModalProduct] = useState(null);
  const [notificationModal, setNotificationModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Save Data
  useEffect(() => { try { localStorage.setItem('mathcore_lp', lp.toString()); } catch {} }, [lp]);
  useEffect(() => { try { localStorage.setItem('mathcore_lc', lc.toString()); } catch {} }, [lc]);
  useEffect(() => { try { localStorage.setItem('mathcore_time', totalTime.toString()); } catch {} }, [totalTime]);
  useEffect(() => { try { localStorage.setItem('mathcore_history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem('mathcore_licenses', JSON.stringify(ownedLicenses)); } catch {} }, [ownedLicenses]);
  useEffect(() => { try { localStorage.setItem('mathcore_completed_units', JSON.stringify(completedUnits)); } catch {} }, [completedUnits]);

  // Timer
  useEffect(() => {
    let interval;
    const isLessonActive = lessonState.topic && !lessonState.isLoading;
    const isDrillActive = drillStatus === 'active';
    const isExamActive = examState.isActive && !examState.isFinished;

    if (isLessonActive || isDrillActive || isExamActive) {
        interval = setInterval(() => setTotalTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [lessonState, drillStatus, examState.isActive, examState.isFinished]);

  // --- Handlers: Shop ---
  const initiatePurchase = (product) => {
      if (displayOwnedLicenses.includes(product.id)) return;
      
      const isLcProduct = LC_PRODUCTS.some(p => p.id === product.id);
      
      if (isLcProduct) {
          if (Number(displayLc) < Number(product.price)) {
              setNotificationModal({
                  title: "LCが足りません",
                  message: `あと ${product.price - displayLc} LC 必要です。\n両替所でLPをLCに交換しましょう。`
              });
              return;
          }
      } else {
          if (Number(displayLp) < Number(product.price)) {
              setNotificationModal({
                  title: "LPが足りません",
                  message: `あと ${product.price - displayLp} LP 必要です。\n計算特訓や演習でLPを貯めましょう。`
              });
              return;
          }
      }
      setPurchaseModalProduct(product);
  };

  const confirmPurchase = () => {
      if (!purchaseModalProduct) return;
      const product = purchaseModalProduct;
      const isLcProduct = LC_PRODUCTS.some(p => p.id === product.id);

      if (isLcProduct) {
          setLc(prev => prev - product.price);
      } else {
          setLp(prev => prev - product.price);
      }
      
      setOwnedLicenses(prev => [...prev, product.id]);
      setPurchaseModalProduct(null);
      setNotificationModal({
          title: "購入完了",
          message: `「${product.title}」を購入しました！`
      });
  };

  const exchangeLpToLc = (amountLc) => {
      const costLp = amountLc * 100;
      if (lp >= costLp) {
          setLp(prev => prev - costLp);
          setLc(prev => prev + amountLc);
          setNotificationModal({
              title: "両替完了",
              message: `${costLp} LP を ${amountLc} LC に交換しました。`
          });
      } else {
          setNotificationModal({
              title: "LP不足",
              message: "LPが足りません。(レート: 100 LP = 1 LC)"
          });
      }
  };

  // --- Handlers: Lesson & Workbook ---
  const handleUnitSelect = async (unit, product) => {
      if (product.type === 'book') {
          // Start Lesson
          setLessonState({
              bookId: product.id,
              unitId: unit.id,
              topic: unit.title,
              category: product.category,
              content: "",
              isLoading: true,
              error: null,
              isCompleted: completedUnits.includes(unit.id),
          });
          setActiveTab('home');
          try {
              const content = await generateLesson(unit.title, product.category);
              setLessonState(prev => ({ ...prev, content, isLoading: false }));
          } catch (err) {
              setLessonState(prev => ({ ...prev, error: "エラーが発生しました", isLoading: false }));
          }
      } else {
          // Start Workbook (Single Unit)
          startExam('workbook', [{unit, category: product.category}]);
      }
  };

  const startExam = async (mode, targets) => {
      setExamState({
          isActive: true,
          isLoading: true,
          mode,
          selectedUnits: targets,
          questions: [],
          currentIndex: 0,
          isFinished: false,
          score: 0,
          earnedLp: 0
      });
      setActiveTab('exam');

      try {
          // Combine topics for multi-unit selection
          const combinedTopics = targets.map(t => t.unit.title).join('・');
          const combinedCategory = targets[0].category; // Use first category for context

          const questions = await generateQuiz(combinedTopics, combinedCategory);
          
          if (questions.length === 0) throw new Error("問題生成に失敗しました");

          setExamState(prev => ({
              ...prev,
              questions,
              isLoading: false
          }));

      } catch (e) {
          setExamState(prev => ({ ...prev, isLoading: false, isActive: false }));
          setNotificationModal({ title: "エラー", message: "問題の生成に失敗しました。" });
      }
  };

  const submitExamAnswer = (answer) => {
      setExamState(prev => {
          const newQuestions = [...prev.questions];
          newQuestions[prev.currentIndex].userAnswer = answer;
          return { ...prev, questions: newQuestions };
      });
  };

  const nextExamQuestion = () => {
      if (examState.currentIndex < examState.questions.length - 1) {
          setExamState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      } else {
          finishExam();
      }
  };
  
  const prevExamQuestion = () => {
      if (examState.currentIndex > 0) {
          setExamState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
      }
  };

  const finishExam = async () => {
     setExamState(prev => ({ ...prev, isLoading: true }));
     
     // Prepare submissions for grading
     const submissions = examState.questions.map(q => ({
         id: q.id,
         question: q.questionText,
         userAnswer: q.userAnswer || "",
         correctAnswer: q.correctAnswer
     }));

     let gradedResults;
     try {
         // Use AI for flexible grading
         gradedResults = await gradeQuizAnswers(submissions);
     } catch (e) {
         console.error(e);
         // Fallback local grading if API fails completely
         gradedResults = submissions.map(s => ({
             id: s.id,
             isCorrect: s.userAnswer.replace(/\s/g, "") === s.correctAnswer.replace(/\s/g, "")
         }));
     }

     let score = 0;
     let earnedLp = 0;

     const gradedQuestions = examState.questions.map(q => {
         const res = gradedResults.find(r => r.id === q.id);
         const isCorrect = res ? res.isCorrect : false;
         
         if (isCorrect) {
             score++;
             // Calculate LP based on difficulty
             if (q.type === 'basic') earnedLp += EXAM_REWARDS.basic;
             else if (q.type === 'applied') earnedLp += EXAM_REWARDS.applied;
             else if (q.type === 'advanced') earnedLp += EXAM_REWARDS.advanced;
             else earnedLp += 5; // Default fallback
         }
         return { ...q, isCorrect };
     });
     
     setExamState(prev => ({
         ...prev,
         questions: gradedQuestions,
         isFinished: true,
         score,
         earnedLp,
         isLoading: false
     }));
     
     setLp(prev => prev + earnedLp);
  };

  const closeExam = () => {
      setExamState({
          isActive: false,
          isLoading: false,
          mode: 'workbook',
          selectedUnits: [],
          questions: [],
          currentIndex: 0,
          isFinished: false,
          score: 0,
          earnedLp: 0
      });
      if (examState.mode === 'workbook') setActiveTab('bookshelf');
  };

  // --- Handlers: Lesson & Drill (Keep existing) ---
  const completeLesson = () => {
      if (lessonState.isCompleted) return;
      const unitReward = 100;
      setCompletedUnits(prev => [...prev, lessonState.unitId]);
      setLp(prev => prev + unitReward);
      setLessonState(prev => ({ ...prev, isCompleted: true }));
      setNotificationModal({ title: "学習完了", message: `${unitReward} LPを獲得しました！` });
  };

  const handleBackToHome = () => {
      setLessonState({ topic: "", category: "", content: "", isLoading: false, error: null, isCompleted: false });
  };
  
  const toggleDrillType = (type) => {
      setDrillSettings(prev => {
          const newTypes = prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type];
          return newTypes.length === 0 ? prev : { ...prev, types: newTypes };
      });
  };

  const startDrill = () => {
      const questions = generateQuestions(drillSettings);
      setDrillQuestions(questions);
      setCurrentQuestionIndex(0);
      setDrillInput("");
      setDrillScore(0);
      setDrillStatus('active');
  };
  
  const submitDrillAnswer = (e) => {
      e.preventDefault();
      const currentQ = drillQuestions[currentQuestionIndex];
      const isCorrect = parseInt(drillInput) === currentQ.answer;
      const updatedQuestions = [...drillQuestions];
      updatedQuestions[currentQuestionIndex] = { ...currentQ, userAnswer: drillInput, isCorrect };
      setDrillQuestions(updatedQuestions);
      if (isCorrect) setDrillScore(prev => prev + 1);
      if (currentQuestionIndex < drillQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setDrillInput("");
      } else {
          finishDrill(updatedQuestions, isCorrect ? drillScore + 1 : drillScore);
      }
  };

  const finishDrill = (results, finalScore) => {
      let baseSum = 0;
      drillSettings.types.forEach(t => baseSum += DRILL_LP_RATES[t]);
      const maxPossibleLP = baseSum * COUNT_MULTIPLIERS[drillSettings.count] * DIFFICULTY_MULTIPLIERS[drillSettings.difficulty];
      const earned = Math.floor(maxPossibleLP * (finalScore / drillSettings.count));
      setEarnedDrillLP(earned);
      setLp(prev => prev + earned);
      setDrillStatus('result');
  };

  const handleQuitDrill = () => {
    setConfirmModal({
        title: "特訓を中断",
        message: "特訓を中断しますか？",
        onConfirm: () => {
            setDrillStatus('idle');
            setDrillScore(0);
            setDrillInput("");
            setCurrentQuestionIndex(0);
            setConfirmModal(null);
        }
    });
  };

  const resetData = () => {
      setConfirmModal({
          title: "データリセット",
          message: "すべての学習データをリセットしますか？",
          onConfirm: () => {
              setLp(0);
              setLc(0);
              setTotalTime(0);
              setHistory([]);
              setOwnedLicenses([]);
              setCompletedUnits([]);
              setDebugMode(false); // Reset debug mode too
              localStorage.clear();
              window.location.reload();
          }
      });
  };
  
  const toggleBookExpanded = (bookId) => {
      setExpandedBooks(prev => ({...prev, [bookId]: !prev[bookId]}));
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = { role: 'user', text: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);
    const context = chatHistory.map(m => ({ role: m.role, text: m.text }));
    if (lessonState.content) context.unshift({ role: 'model', text: `Context: ${lessonState.content.substring(0, 500)}...` });
    const responseText = await generateChatResponse(context, userMessage.text);
    setChatHistory(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setIsChatLoading(false);
  };
  
  const getCategoryColor = (category, isDark = false) => {
      if (category.includes("1年生")) return isDark ? "dark:bg-orange-900 dark:text-orange-200" : "bg-orange-100 text-orange-600";
      if (category.includes("2年生")) return isDark ? "dark:bg-green-900 dark:text-green-200" : "bg-green-100 text-green-600";
      if (category.includes("3年生")) return isDark ? "dark:bg-blue-900 dark:text-blue-200" : "bg-blue-100 text-blue-600";
      if (category.includes("4年生")) return isDark ? "dark:bg-purple-900 dark:text-purple-200" : "bg-purple-100 text-purple-600";
      if (category.includes("5年生")) return isDark ? "dark:bg-red-900 dark:text-red-200" : "bg-red-100 text-red-600";
      if (category.includes("6年生")) return isDark ? "dark:bg-indigo-900 dark:text-indigo-200" : "bg-indigo-100 text-indigo-600";
      if (category.includes("中学")) return isDark ? "dark:bg-teal-900 dark:text-teal-200" : "bg-teal-100 text-teal-600";
      if (category.includes("高校")) return isDark ? "dark:bg-sky-900 dark:text-sky-200" : "bg-sky-100 text-sky-600";
      if (category.includes("大学")) return isDark ? "dark:bg-slate-700 dark:text-slate-300" : "bg-slate-200 text-slate-700";
      return isDark ? "dark:bg-slate-700 dark:text-slate-300" : "bg-slate-100 text-slate-500";
  };

  const getCategoryGradient = (category) => {
      if (category.includes("1年生")) return "from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("2年生")) return "from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("3年生")) return "from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("4年生")) return "from-purple-50 to-fuchsia-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("5年生")) return "from-red-50 to-rose-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("6年生")) return "from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("中学")) return "from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("高校")) return "from-sky-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800";
      if (category.includes("大学")) return "from-gray-100 to-slate-200 dark:from-slate-800 dark:to-black";
      if (category.includes("娯楽")) return "from-pink-50 to-rose-100 dark:from-slate-800 dark:to-slate-900";
      return "from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-800";
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* 1. Global Top Header */}
      <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50 shadow-sm relative shrink-0">
        <div className="flex items-center gap-3">
             <div className="font-bold text-lg flex items-center gap-2">
                <span className="text-accent"><SparklesIcon /></span>
                <span className="hidden sm:inline">Σxplore Math</span>
             </div>
        </div>
        <div className="flex items-center justify-center flex-1 gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-inner shrink-0 ${debugMode ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">LP</span>
                <span className={`font-mono font-bold text-lg ${debugMode ? 'text-amber-600' : 'text-accent'}`}>{displayLp.toLocaleString()}</span>
            </div>
            <div className="px-4 py-1.5 rounded-full flex items-center gap-2 border border-yellow-200 dark:border-yellow-700 shadow-inner bg-yellow-50 dark:bg-yellow-900/20 shrink-0">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">LC</span>
                <span className="font-mono font-bold text-lg text-yellow-600 dark:text-yellow-400">{displayLc.toLocaleString()}</span>
            </div>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors" title="GitHub">
                <GithubIcon />
            </a>
        </div>
        <button onClick={() => setShowInfo(true)} className="p-2 text-slate-500 rounded-full"><InfoIcon /></button>
      </header>

      {/* 2. Global Navigation Tabs */}
      <nav className="flex items-center justify-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon />} label="ホーム" />
        <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<CalculatorIcon />} label="計算特訓" />
        <TabButton active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} icon={<ExamIcon />} label="演習" />
        <TabButton active={activeTab === 'bookshelf'} onClick={() => setActiveTab('bookshelf')} icon={<BookIcon />} label="本棚" />
        <TabButton active={activeTab === 'shop'} onClick={() => { setActiveTab('shop'); setShopView('map'); }} icon={<ShopIcon />} label="ショップ" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="設定" />
      </nav>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
             <div className="h-full w-full overflow-hidden flex flex-col">
                {!lessonState.topic ? (
                    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                         <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">ダッシュボード</h2>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex items-center gap-5">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full"><ClockIcon /></div>
                            <div>
                                <div className="text-sm font-medium text-slate-500">総学習時間</div>
                                <div className="text-3xl font-bold font-mono">{formatTime(totalTime)}</div>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BookIcon /> 学習履歴</h3>
                        <div className="space-y-3 mb-8">
                            {history.length === 0 ? <div className="text-center py-12 text-slate-400">学習履歴はまだありません</div> : history.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                    <div><div className="font-bold">{item.topic}</div><div className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</div></div>
                                    <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-slate-950">
                        <header className="h-14 border-b border-slate-200 flex items-center px-4 shrink-0 bg-white/90 backdrop-blur">
                            <button onClick={handleBackToHome} className="mr-4 text-sm font-bold text-accent">← 戻る</button>
                            <h1 className="font-bold truncate">{lessonState.topic}</h1>
                        </header>
                        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 max-w-4xl mx-auto w-full">
                            {lessonState.isLoading ? (
                                <div className="animate-pulse space-y-4 py-10">
                                    <div className="h-8 bg-slate-200 rounded w-3/4 mb-8"></div>
                                    <div className="text-center text-slate-400">AIが解説を作成中... (5000文字以上)</div>
                                </div>
                            ) : (
                                <div className="space-y-12">
                                    <MarkdownRenderer content={lessonState.content} />
                                    <div className="flex justify-center pt-8 border-t border-slate-100">
                                        <button onClick={completeLesson} disabled={lessonState.isCompleted} className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg ${lessonState.isCompleted ? 'bg-green-500 text-white' : 'bg-accent text-white'}`}>
                                            {lessonState.isCompleted ? '獲得済み' : '読了して 100 LP を獲得'}
                                        </button>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-slate-200">
                                        <h3 className="text-lg font-bold mb-4">AIチューターに質問</h3>
                                        <div className="space-y-4 mb-4">
                                            {chatHistory.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-accent text-white' : 'bg-slate-100'}`}><MarkdownRenderer content={msg.text} /></div>
                                                </div>
                                            ))}
                                            {isChatLoading && <div className="text-slate-400 text-sm">入力中...</div>}
                                        </div>
                                        <form onSubmit={handleChatSubmit} className="relative">
                                            <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="w-full p-3 pr-12 rounded-xl border border-slate-300" placeholder="質問を入力" disabled={isChatLoading} />
                                            <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-2 p-1.5 bg-accent text-white rounded-lg"><SendIcon /></button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
             </div>
          )}

          {/* EXAM TAB */}
          {activeTab === 'exam' && (
              <div className="h-full w-full overflow-hidden flex flex-col">
                  {!examState.isActive ? (
                      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ExamIcon /> 演習（Mock Exam）</h2>
                          <p className="mb-6 text-slate-600 dark:text-slate-400">
                              所持している問題集の単元を選択して、自分だけの模擬試験を作成できます。<br/>
                              （問題集はショップで購入すると選択できるようになります）
                          </p>

                          <div className="space-y-6 mb-20">
                              {/* Group units by owned workbooks */}
                              {PRODUCTS.filter(p => p.type === 'workbook' && displayOwnedLicenses.includes(p.id)).length > 0 ? (
                                  PRODUCTS.filter(p => p.type === 'workbook' && displayOwnedLicenses.includes(p.id)).map(book => (
                                      <div key={book.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                          <h3 className="font-bold mb-4 text-lg border-b pb-2">{book.title}</h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                              {book.units.map(unit => {
                                                  const isSelected = examState.selectedUnits.some(u => u.unit.id === unit.id);
                                                  return (
                                                      <button
                                                          key={unit.id}
                                                          onClick={() => {
                                                              setExamState(prev => {
                                                                  const exists = prev.selectedUnits.some(u => u.unit.id === unit.id);
                                                                  const newSelection = exists 
                                                                    ? prev.selectedUnits.filter(u => u.unit.id !== unit.id)
                                                                    : [...prev.selectedUnits, {unit, category: book.category}];
                                                                  return {...prev, selectedUnits: newSelection};
                                                              });
                                                          }}
                                                          className={`p-3 rounded-lg border text-sm text-left transition-all ${isSelected ? 'bg-accent text-white border-accent' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}
                                                      >
                                                          {isSelected && <span className="mr-2">✓</span>}
                                                          {unit.title}
                                                      </button>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className="text-center py-10 bg-slate-100 rounded-xl">
                                      <p className="text-slate-500">所持している問題集がありません。<br/>ショップで購入してください。</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  ) : (
                      // Exam Active View
                      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                          <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                              <div className="font-bold">
                                  {examState.mode === 'workbook' ? '問題集モード' : '模擬試験モード'}
                              </div>
                              <button onClick={closeExam} className="text-sm text-red-500 font-bold">中断する</button>
                          </header>
                          
                          <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full">
                              {examState.isLoading ? (
                                  <div className="flex flex-col items-center justify-center h-full">
                                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                                      <p className="text-slate-500">
                                          {examState.questions.length > 0 ? "AIが採点中..." : "AIが問題を作成中..."}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-2">
                                          {examState.questions.length > 0 ? "柔軟に判定しています" : "基本10問・応用5問・発展5問 (計20問)"}
                                      </p>
                                  </div>
                              ) : examState.isFinished ? (
                                  // Result View
                                  <div className="space-y-8">
                                      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg text-center">
                                          <h2 className="text-3xl font-bold mb-2">結果発表</h2>
                                          <div className="text-5xl font-black text-accent mb-4">{examState.score} <span className="text-2xl text-slate-400">/ {examState.questions.length}</span></div>
                                          <div className="text-xl text-slate-500 font-bold">獲得LP: +{examState.earnedLp} LP</div>
                                          <button onClick={closeExam} className="mt-6 px-8 py-3 bg-slate-200 rounded-full font-bold">終了する</button>
                                      </div>
                                      
                                      <div className="space-y-6">
                                          {examState.questions.map((q, idx) => (
                                              <div key={idx} className={`p-6 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-900 ${q.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                                                  <div className="flex justify-between items-start mb-4">
                                                      <div className="flex gap-2">
                                                          <span className={`text-xs font-bold px-2 py-1 rounded ${q.type === 'basic' ? 'bg-blue-100 text-blue-700' : q.type === 'applied' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                              {q.type === 'basic' ? '基本' : q.type === 'applied' ? '応用' : '発展'}
                                                          </span>
                                                          <span className="text-xs text-slate-400 self-center">
                                                              {q.type === 'basic' ? '5LP' : q.type === 'applied' ? '10LP' : '15LP'}
                                                          </span>
                                                      </div>
                                                      <span className={`font-bold ${q.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                                          {q.isCorrect ? '正解' : '不正解'}
                                                      </span>
                                                  </div>
                                                  <div className="mb-4">
                                                      <p className="text-sm text-slate-500 mb-1">問題 {idx + 1}</p>
                                                      <div className="font-bold text-lg"><MarkdownRenderer content={q.questionText} /></div>
                                                  </div>
                                                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                                                      <p className="text-xs text-slate-400 mb-1">あなたの回答</p>
                                                      <div className="font-mono text-lg">{q.userAnswer || '(未回答)'}</div>
                                                  </div>
                                                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                                                      <p className="text-xs text-green-600 mb-1">正解</p>
                                                      <div className="font-mono text-lg"><MarkdownRenderer content={q.correctAnswer} /></div>
                                                  </div>
                                                  <div className="mt-4 pt-4 border-t border-slate-100">
                                                      <p className="font-bold mb-2">解説</p>
                                                      <MarkdownRenderer content={q.explanation} />
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ) : (
                                  // Question View
                                  <div className="flex flex-col h-full">
                                      {/* Progress Bar */}
                                      <div className="w-full bg-slate-200 h-2 rounded-full mb-6 overflow-hidden">
                                          <div className="bg-accent h-full transition-all" style={{width: `${((examState.currentIndex + 1) / examState.questions.length) * 100}%`}}></div>
                                      </div>
                                      
                                      <div className="flex-1 overflow-y-auto mb-4">
                                          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
                                              <div className="flex justify-between mb-4">
                                                  <span className="text-sm font-bold text-slate-400">Q.{examState.currentIndex + 1}</span>
                                                  <span className={`text-xs font-bold px-2 py-1 rounded ${examState.questions[examState.currentIndex].type === 'basic' ? 'bg-blue-100 text-blue-700' : examState.questions[examState.currentIndex].type === 'applied' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                      {examState.questions[examState.currentIndex].type === 'basic' ? '基本' : examState.questions[examState.currentIndex].type === 'applied' ? '応用' : '発展'}
                                                  </span>
                                              </div>
                                              <div className="text-xl font-medium leading-relaxed">
                                                  <MarkdownRenderer content={examState.questions[examState.currentIndex].questionText} />
                                              </div>
                                          </div>
                                          
                                          <MemoPad />
                                      </div>

                                      <div className="mt-auto pt-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur sticky bottom-0">
                                          <input 
                                            value={examState.questions[examState.currentIndex].userAnswer || ''}
                                            onChange={e => submitExamAnswer(e.target.value)}
                                            className="w-full p-4 mb-4 rounded-xl border border-slate-300 dark:border-slate-700 font-mono text-lg"
                                            placeholder="解答を入力してください (例: $x=2$)"
                                          />
                                          <div className="flex gap-4">
                                              <button 
                                                onClick={prevExamQuestion}
                                                disabled={examState.currentIndex === 0}
                                                className="flex-1 py-3 bg-slate-100 rounded-xl font-bold disabled:opacity-50"
                                              >
                                                  前へ
                                              </button>
                                              <button 
                                                onClick={nextExamQuestion}
                                                className="flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg"
                                              >
                                                  {examState.currentIndex === examState.questions.length - 1 ? '採点する' : '次へ'}
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </main>
                      </div>
                  )}
                  {/* Start Button for Mock Exam */}
                  {!examState.isActive && examState.selectedUnits.length > 0 && (
                      <div className="fixed bottom-20 left-0 right-0 p-4 flex justify-center pointer-events-none">
                          <button 
                            onClick={() => startExam('mock', examState.selectedUnits)}
                            className="bg-accent text-white px-8 py-4 rounded-full font-bold shadow-xl pointer-events-auto transform transition hover:scale-105"
                          >
                              {examState.selectedUnits.length}単元で演習を開始する
                          </button>
                      </div>
                  )}
              </div>
          )}

          {/* TRAINING TAB (Keep Existing) */}
          {activeTab === 'training' && (
              <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto flex flex-col justify-center min-h-full">
                  {drillStatus === 'idle' && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2"><CalculatorIcon /> 計算特訓</h2>
                          
                           <div className="mb-8">
                              <h3 className="font-semibold mb-3">難易度</h3>
                              <div className="flex gap-2">
                                  {(['easy', 'normal', 'hard']).map(diff => (
                                      <button key={diff} onClick={() => setDrillSettings(prev => ({ ...prev, difficulty: diff }))} className={`flex-1 py-3 rounded-xl border ${drillSettings.difficulty === diff ? 'bg-slate-800 text-white' : ''}`}>{diff}</button>
                                  ))}
                              </div>
                          </div>
                          <div className="mb-8">
                              <h3 className="font-semibold mb-3">出題範囲</h3>
                              <div className="grid grid-cols-2 gap-3">
                                  {(['add', 'sub', 'mul', 'div', 'exp', 'root']).map(type => (
                                      <button key={type} onClick={() => toggleDrillType(type)} className={`p-3 rounded-xl border ${drillSettings.types.includes(type) ? 'border-accent bg-accent/5 text-accent' : ''}`}>{type}</button>
                                  ))}
                              </div>
                          </div>
                          <button onClick={startDrill} className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-lg">スタート</button>
                      </div>
                  )}
                  {drillStatus === 'active' && (
                       <div className="flex flex-col h-full max-h-[800px]">
                          <div className="flex justify-between items-center mb-4 px-2">
                              <button onClick={handleQuitDrill} className="text-xs text-red-500">中断</button>
                              <span>Q.{currentQuestionIndex + 1}</span>
                              <span>Score: {drillScore}</span>
                          </div>
                          <div className="bg-white p-8 rounded-2xl shadow-sm text-center mb-4"><span className="text-4xl font-mono"><MarkdownRenderer content={`$$ ${drillQuestions[currentQuestionIndex].question} $$`} /></span></div>
                          <MemoPad />
                          <form onSubmit={submitDrillAnswer} className="mt-auto flex gap-2">
                              <input type="number" inputMode="decimal" autoFocus value={drillInput} onChange={e => setDrillInput(e.target.value)} className="flex-1 p-4 rounded-xl border text-2xl text-center" />
                              <button type="submit" disabled={!drillInput} className="px-6 bg-slate-800 text-white rounded-xl">次へ</button>
                          </form>
                      </div>
                  )}
                  {drillStatus === 'result' && (
                      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                          <h2 className="text-2xl font-bold mb-4">特訓完了!</h2>
                          <div className="text-6xl font-black text-accent mb-4">+{earnedDrillLP} LP</div>
                          <button onClick={() => setDrillStatus('idle')} className="w-full py-3 bg-slate-100 rounded-xl">戻る</button>
                      </div>
                  )}
              </div>
          )}

          {/* BOOKSHELF TAB (Updated) */}
          {activeTab === 'bookshelf' && (
             <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookIcon /> 本棚</h2>
                {displayOwnedLicenses.length > 0 ? (
                    <div className="space-y-6 mb-20">
                        {PRODUCTS.filter(p => displayOwnedLicenses.includes(p.id)).map(book => {
                            const totalUnits = book.units.length;
                            const completedCount = book.units.filter(u => completedUnits.includes(u.id)).length; 
                            const progress = Math.round((completedCount / totalUnits) * 100); 
                            const isExpanded = expandedBooks[book.id] || false;
                            
                            return (
                                <div key={book.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                                    {book.type === 'workbook' && (
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">問題集</div>
                                    )}
                                    <div className="p-6 flex items-start gap-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-sm text-white shrink-0 bg-gradient-to-br ${getCategoryGradient(book.category)}`}>
                                            {book.type === 'workbook' ? <ExamIcon /> : <BookIcon />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{book.title}</h3>
                                            <p className="text-xs text-slate-500 mb-2">{book.category}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 p-4 bg-slate-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {(isExpanded ? book.units : book.units.slice(0, 4)).map(unit => (
                                                <button key={unit.id} onClick={() => handleUnitSelect(unit, book)} className="text-left text-xs p-2 rounded border bg-white hover:border-accent flex justify-between">
                                                    <span className="truncate">{unit.title}</span>
                                                    {book.type === 'workbook' ? <span className="text-slate-400">演習</span> : <span className="text-slate-400">学習</span>}
                                                </button>
                                            ))}
                                        </div>
                                        {book.units.length > 4 && (
                                            <button onClick={() => toggleBookExpanded(book.id)} className="w-full text-center text-xs mt-2 text-slate-400">
                                                {isExpanded ? '閉じる' : 'すべて見る'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">本棚は空です。<br/>ショップで購入してください。</div>
                )}
             </div>
          )}
          
          {/* SHOP TAB (Updated with Shopping Mall Map) */}
          {activeTab === 'shop' && (
              <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
                  {shopView === 'map' && (
                      <div className="animate-in fade-in zoom-in duration-300">
                          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShopIcon /> マス・スクエア (Math Square)</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* 1. 数理堂 (Suurido) */}
                              <button 
                                onClick={() => setShopView('suurido')}
                                className="group relative h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform"
                              >
                                  <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-bl-[100px]"></div>
                                  <div>
                                      <h3 className="text-3xl font-black mb-2">数理堂</h3>
                                      <p className="text-indigo-100 font-bold opacity-80">Suurido Books</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><BookIcon /></div>
                                      <span className="text-sm font-medium">参考書・問題集を購入<br/>(LPを使用)</span>
                                  </div>
                              </button>

                              {/* 2. 数楽カフェ (Math Cafe) */}
                              <button 
                                onClick={() => setShopView('cafe')}
                                className="group relative h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-orange-400 to-pink-500 text-white p-6 flex flex-col justify-between hover:scale-[1.02] transition-transform"
                              >
                                  <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-bl-[100px]"></div>
                                  <div>
                                      <h3 className="text-3xl font-black mb-2">数楽カフェ</h3>
                                      <p className="text-orange-100 font-bold opacity-80">Math Café</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><CoffeeIcon /></div>
                                      <span className="text-sm font-medium">娯楽数学書・読み物<br/>(LCを使用)</span>
                                  </div>
                              </button>

                              {/* 3. 両替所 (Exchange) */}
                              <button 
                                onClick={() => setShopView('exchange')}
                                className="md:col-span-2 group relative h-40 rounded-3xl overflow-hidden shadow-md border-4 border-slate-100 dark:border-slate-800 bg-slate-800 text-white p-6 flex items-center justify-between hover:scale-[1.01] transition-transform"
                              >
                                  <div className="flex items-center gap-6">
                                      <div className="p-4 bg-yellow-500 text-black rounded-full"><ExchangeIcon /></div>
                                      <div>
                                          <h3 className="text-2xl font-bold">両替所</h3>
                                          <p className="text-slate-400">Exchange Center</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-sm text-slate-300 mb-1">現在のレート</div>
                                      <div className="text-2xl font-mono font-bold text-yellow-400">100 LP = 1 LC</div>
                                  </div>
                              </button>
                          </div>
                      </div>
                  )}

                  {shopView === 'suurido' && (
                      <div className="animate-in slide-in-from-right duration-300">
                          <div className="flex items-center mb-6 gap-4">
                              <button onClick={() => setShopView('map')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">←</button>
                              <h2 className="text-2xl font-bold flex items-center gap-2">数理堂 (LPショップ)</h2>
                          </div>
                          
                          {/* Filter UI */}
                          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                              {[
                                  { id: 'all', label: 'すべて' },
                                  { id: 'elem', label: '小学生' },
                                  { id: 'jhs', label: '中学生' },
                                  { id: 'hs', label: '高校生' },
                                  { id: 'univ', label: '大学生' },
                              ].map(f => (
                                  <button
                                      key={f.id}
                                      onClick={() => setShopFilter(f.id)}
                                      className={`
                                          px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                                          ${shopFilter === f.id 
                                              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}
                                      `}
                                  >
                                      {f.label}
                                  </button>
                              ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                              {PRODUCTS.filter(p => !LC_PRODUCTS.some(lc => lc.id === p.id)).filter(p => {
                                  if (shopFilter === 'all') return true;
                                  if (shopFilter === 'elem') return p.category.includes('小学');
                                  if (shopFilter === 'jhs') return p.category.includes('中学');
                                  if (shopFilter === 'hs') return p.category.includes('高校');
                                  if (shopFilter === 'univ') return p.category.includes('大学');
                                  return true;
                              }).map(product => {
                                  const isOwned = displayOwnedLicenses.includes(product.id);
                                  return (
                                      <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                                          {product.type === 'workbook' && (
                                              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">問題集</div>
                                          )}
                                          <div className={`p-6 bg-gradient-to-br ${getCategoryGradient(product.category)} border-b border-slate-100`}>
                                               <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm ${getCategoryColor(product.category)}`}>{product.category}</span>
                                               <h3 className="text-xl font-bold mt-3">{product.title}</h3>
                                          </div>
                                          <div className="p-6">
                                              <p className="text-slate-500 text-sm mb-6">{product.description}</p>
                                              <div className="flex items-center justify-between">
                                                  <div className="font-bold text-2xl text-accent">{product.price} <span className="text-sm text-slate-400">LP</span></div>
                                                  <button 
                                                    onClick={() => initiatePurchase(product)} 
                                                    disabled={isOwned}
                                                    className={`px-6 py-2.5 font-bold rounded-xl ${isOwned ? 'bg-slate-100 text-slate-400' : 'bg-accent text-white shadow-lg'}`}
                                                  >
                                                      {isOwned ? "購入済み" : "購入する"}
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {shopView === 'cafe' && (
                      <div className="animate-in slide-in-from-right duration-300">
                          <div className="flex items-center mb-6 gap-4">
                              <button onClick={() => setShopView('map')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">←</button>
                              <h2 className="text-2xl font-bold flex items-center gap-2 text-pink-600">数楽カフェ (LCショップ)</h2>
                          </div>
                          
                          <p className="mb-8 text-slate-600">ライセンスコイン(LC)を使って、数学の不思議や面白さに触れる特別な本を手に入れましょう。</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                              {LC_PRODUCTS.map(product => {
                                  const isOwned = displayOwnedLicenses.includes(product.id);
                                  return (
                                      <div key={product.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-pink-100 dark:border-pink-900 overflow-hidden relative">
                                          <div className={`p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 border-b border-pink-100`}>
                                               <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm bg-pink-100 text-pink-600`}>{product.category}</span>
                                               <h3 className="text-xl font-bold mt-3 text-slate-800 dark:text-pink-100">{product.title}</h3>
                                          </div>
                                          <div className="p-6">
                                              <p className="text-slate-500 text-sm mb-6">{product.description}</p>
                                              <div className="flex items-center justify-between">
                                                  <div className="font-bold text-2xl text-yellow-500 flex items-center gap-1">{product.price} <span className="text-sm text-slate-400">LC</span></div>
                                                  <button 
                                                    onClick={() => initiatePurchase(product)} 
                                                    disabled={isOwned}
                                                    className={`px-6 py-2.5 font-bold rounded-xl ${isOwned ? 'bg-slate-100 text-slate-400' : 'bg-pink-500 text-white shadow-lg shadow-pink-200'}`}
                                                  >
                                                      {isOwned ? "所持済み" : "交換する"}
                                                  </button>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {shopView === 'exchange' && (
                      <div className="animate-in slide-in-from-right duration-300 max-w-2xl mx-auto">
                          <div className="flex items-center mb-6 gap-4">
                              <button onClick={() => setShopView('map')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">←</button>
                              <h2 className="text-2xl font-bold">両替所</h2>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
                              <div className="mb-8">
                                  <p className="text-slate-500 mb-2">現在の所持ポイント</p>
                                  <div className="flex justify-center gap-8 items-end">
                                      <div className="text-right">
                                          <div className="text-4xl font-bold text-accent">{displayLp.toLocaleString()}</div>
                                          <div className="text-xs font-bold text-slate-400">LP</div>
                                      </div>
                                      <div className="text-2xl text-slate-300">→</div>
                                      <div className="text-left">
                                          <div className="text-4xl font-bold text-yellow-500">{displayLc.toLocaleString()}</div>
                                          <div className="text-xs font-bold text-slate-400">LC</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl mb-8">
                                  <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-300">交換レート</h3>
                                  <div className="text-xl font-mono">100 LP  =  1 LC</div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                  <button onClick={() => exchangeLpToLc(1)} className="py-4 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition-colors">
                                      1 LC<br/><span className="text-xs font-normal text-slate-500">-100 LP</span>
                                  </button>
                                  <button onClick={() => exchangeLpToLc(10)} className="py-4 bg