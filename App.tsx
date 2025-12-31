
import React, { useState, useEffect, useRef } from 'react';
import { generateLesson, generateQuiz, gradeQuizAnswers } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';

// --- Full Curriculum Data ---
const CURRICULUM = [
    { id: 'e1-up', title: 'はじめての算数 上', category: '小学1年生', price: 100, prompt: '小学校一年生がわかりやすいように解説。ひらがな多め。足し算、引き算、かたち遊び(立体)、とけい、どちらが多い、百までの数、かたちづくり(平面)、どんな式になるのかな、同じ数づつに分けようを網羅。', units: [{id:'1-1', title:'たしざん'}, {id:'1-2', title:'ひきざん'}, {id:'1-3', title:'かたちあそび(立体)'}, {id:'1-4', title:'とけい'}, {id:'1-5', title:'どちらがおおい'}, {id:'1-6', title:'ひゃくまでの数'}, {id:'1-7', title:'かたちづくり(平面)'}, {id:'1-8', title:'どんなしきになるのかな'}, {id:'1-9', title:'おなじかずづつにわけよう'}] },
    { id: 'e2-down', title: 'はじめての算数 下', category: '小学2年生', price: 100, prompt: '2年生にわかりやすいように解説。', units: [{id:'2-1', title:'表とグラフ'}, {id:'2-2', title:'時こくと時間'}, {id:'2-3', title:'たし算のひっ算'}, {id:'2-4', title:'ひき算のひっ算'}, {id:'2-5', title:'長さ（cm, mm）'}, {id:'2-6', title:'1000までの数'}, {id:'2-7', title:'かさ（L, dL, mL）'}, {id:'2-8', title:'たし算とひき算（図を使う）'}, {id:'2-9', title:'かけ算（九九）'}, {id:'2-10', title:'三角形と四角形'}, {id:'2-11', title:'10000までの数'}, {id:'2-12', title:'長い長さ（m）'}, {id:'2-13', title:'分数（基本）'}, {id:'2-14', title:'はこの形'}] },
    { id: 'e3-up', title: '楽しい算数 上', category: '小学3年生', price: 500, prompt: '3年生にわかりやすいように解説。', units: [{id:'3-1', title:'九九の表と図'}, {id:'3-2', title:'時こくと時間（計算）'}, {id:'3-3', title:'わり算'}, {id:'3-4', title:'たし算とひき算の筆算(3・4けた)'}, {id:'3-5', title:'長いものの長さ(km, まきじゃく)'}, {id:'3-6', title:'あまりのあるわり算'}, {id:'3-7', title:'一万をこえる数'}, {id:'3-8', title:'かけ算の筆算(1)'}, {id:'3-9', title:'円と球'}, {id:'3-10', title:'小数'}, {id:'3-11', title:'重さ(g, kg)'}, {id:'3-12', title:'分数(分母が同じ加減)'}, {id:'3-13', title:'□を使った式'}, {id:'3-14', title:'かけ算の筆算(2)'}, {id:'3-15', title:'三角形(二等辺・正三角形)'}, {id:'3-16', title:'棒グラフと表'}, {id:'3-17', title:'そろばん'}] },
    { id: 'e4-down', title: '楽しい算数 下', category: '小学4年生', price: 500, prompt: '4年生にわかりやすいように解説。', units: [{id:'4-1', title:'大きな数（億・兆）'}, {id:'4-2', title:'グラフ（折れ線グラフ）'}, {id:'4-3', title:'わり算の筆算(1)'}, {id:'4-4', title:'角（分度器）'}, {id:'4-5', title:'わり算の筆算(2)'}, {id:'4-6', title:'垂直・平行と四角形'}, {id:'4-7', title:'そろばん'}, {id:'4-8', title:'小数'}, {id:'4-9', title:'式と計算の順序'}, {id:'4-10', title:'面積(cm2, m2, a, ha)'}, {id:'4-11', title:'小数の乗法・除法'}, {id:'4-12', title:'変わり方'}, {id:'4-13', title:'分数（真・仮・帯）'}, {id:'4-14', title:'直方体と立方体'}] },
    { id: 'e5-up', title: '面白い算数 上', category: '小学5年生', price: 750, prompt: '5年生に。語彙を少しずつ難しく。', units: [{id:'5-1', title:'整数と小数の仕組み'}, {id:'5-2', title:'体積'}, {id:'5-3', title:'比例'}, {id:'5-4', title:'小数のかけ算'}, {id:'5-5', title:'小数のわり算'}, {id:'5-6', title:'合同な図形'}, {id:'5-7', title:'図形の角'}, {id:'5-8', title:'偶数と奇数、倍数と約数'}, {id:'5-9', title:'分数（通分・約分）'}, {id:'5-10', title:'平均'}, {id:'5-11', title:'単位量あたりの大きさ'}, {id:'5-12', title:'図形の面積'}, {id:'5-13', title:'正多角形と円周'}, {id:'5-14', title:'百分率とグラフ'}, {id:'5-15', title:'角柱と円柱'}] },
    { id: 'e6-down', title: '面白い算数 下', category: '小学6年生', price: 750, prompt: '6年生に。総復習含む。', units: [{id:'6-1', title:'対称な図形'}, {id:'6-2', title:'文字と式'}, {id:'6-3', title:'分数のかけ算'}, {id:'6-4', title:'分数のわり算'}, {id:'6-5', title:'比'}, {id:'6-6', title:'拡大図と縮図'}, {id:'6-7', title:'円の面積'}, {id:'6-8', title:'角柱と円柱の体積'}, {id:'6-9', title:'およその面積と体積'}, {id:'6-10', title:'並べ方と組み合わせ'}, {id:'6-11', title:'データの活用'}, {id:'6-12', title:'算数のまとめ（6年間の総復習）'}] },
    { id: 'e-review', title: '小学校 重要単元13選', category: '6年生復習用', price: 800, prompt: '6年生の復習用。わかりやすく。', units: [{id:'r-1', title:'くり上がり・くり下がり'}, {id:'r-2', title:'九九'}, {id:'r-3', title:'時こくと時間'}, {id:'r-4', title:'わり算の基礎'}, {id:'r-5', title:'小数・分数の仕組み'}, {id:'r-6', title:'2けたでわる筆算'}, {id:'r-7', title:'面積の公式'}, {id:'r-8', title:'分数の四則計算'}, {id:'r-9', title:'単位量あたりの大きさ'}, {id:'r-10', title:'割合'}, {id:'r-11', title:'速さ'}, {id:'r-12', title:'文字と式(xの使用)'}] },
    { id: 'j1-p1', title: '中等学校数学（パート1）', category: '中学1年生', price: 1000, prompt: 'マイナスの概念など、世界一細かく。', units: [{id:'j1-1', title:'正の数・負の数'}, {id:'j1-2', title:'文字の式'}, {id:'j1-3', title:'一元一次方程式'}, {id:'j1-4', title:'変化と対応（比例・反比例）'}, {id:'j1-5', title:'平面図形'}, {id:'j1-6', title:'空間図形'}, {id:'j1-7', title:'データの活用'}] },
    { id: 'j2-main', title: '中等学校数学', category: '中学2年生', price: 1250, prompt: '中学2年生向け。論理的に詳細解説。', units: [{id:'j2-1', title:'式の計算'}, {id:'j2-2', title:'連立二元一次方程式'}, {id:'j2-3', title:'一次関数'}, {id:'j2-4', title:'図形の性質（平行と合同）'}, {id:'j2-5', title:'図形の性質（三角形と四角形）'}, {id:'j2-6', title:'データの活用(確率)'}, {id:'j2-7', title:'箱ひげ図'}] },
    { id: 'j3-pre', title: '中等学校数学（前期）', category: '中学3年生', price: 1500, prompt: '受験も見据え、平方根や二次関数を詳説。', units: [{id:'j3-1', title:'式の展開と因数分解'}, {id:'j3-2', title:'平方根'}, {id:'j3-3', title:'二次方程式'}, {id:'j3-4', title:'関数 y=ax^2'}, {id:'j3-5', title:'図形の性質と相似'}, {id:'j3-6', title:'円の性質'}, {id:'j3-7', title:'三平方の定理'}, {id:'j3-8', title:'標本調査'}] },
    { id: 'j-review', title: '中学数学 重要単元11選', category: '中学復習用', price: 1750, prompt: '中学3年間の重要ツールを網羅。', units: [{id:'jr-1', title:'正負の数'}, {id:'jr-2', title:'文字の式'}, {id:'jr-3', title:'方程式の道具'}, {id:'jr-4', title:'一次関数'}, {id:'jr-5', title:'関数 y=ax^2'}, {id:'jr-6', title:'三角形の合同と証明'}, {id:'jr-7', title:'展開と因数分解'}, {id:'jr-8', title:'平方根'}, {id:'jr-9', title:'図形の相似'}, {id:'jr-10', title:'三平方の定理'}, {id:'jr-11', title:'確率・箱ひげ図'}] },
    { id: 'h1-i', title: '高校数学 I', category: '高校数学', price: 750, prompt: '数I。厳密かつ丁寧に。', units: [{id:'h1-1', title:'数と式'}, {id:'h1-2', title:'図形と計量'}, {id:'h1-3', title:'二次関数'}, {id:'h1-4', title:'データの分析'}] },
    { id: 'h1-a', title: '高校数学 A', category: '高校数学', price: 750, prompt: '数A。論理の訓練。', units: [{id:'ha-1', title:'図形の性質'}, {id:'ha-2', title:'場合の数と確率'}, {id:'ha-3', title:'数学と人間の活動'}] },
    { id: 'h2-ii', title: '高校数学 II', category: '高校数学', price: 875, prompt: '数II。微積分の入り口。', units: [{id:'h2-1', title:'数と式・複素数'}, {id:'h2-2', title:'図形と方程式'}, {id:'h2-3', title:'指数関数・対数関数'}, {id:'h2-4', title:'三角関数'}, {id:'h2-5', title:'微分・積分の考え'}] },
    { id: 'h2-b', title: '高校数学 B', category: '高校数学', price: 875, prompt: '数B。数列と統計。', units: [{id:'hb-1', title:'数列'}, {id:'hb-2', title:'統計的な推測'}, {id:'hb-3', title:'数学と社会生活'}] },
    { id: 'h3-iii', title: '高校数学 III', category: '高校数学', price: 1000, prompt: '数III。理系数学の極み。', units: [{id:'h3-1', title:'極限'}, {id:'h3-2', title:'微分法'}, {id:'h3-3', title:'積分法'}] },
    { id: 'h3-c', title: '高校数学 C', category: '高校数学', price: 1000, prompt: '数C。ベクトルと複素数平面。', units: [{id:'hc-1', title:'ベクトル'}, {id:'hc-2', title:'平面上の曲線と複素数平面'}, {id:'hc-3', title:'数学的な表現の工夫'}] },
    { id: 'h-review', title: '高校数学 総復習', category: '高校数学', price: 1600, prompt: '高校数学の主要8単元を横断復習。', units: [{id:'hr-1', title:'微分・積分(II)'}, {id:'hr-2', title:'ベクトル(C)'}, {id:'hr-3', title:'数列(B)'}, {id:'hr-4', title:'確率(A)'}, {id:'hr-5', title:'微分・積分(III)'}, {id:'hr-6', title:'複素数平面(C)'}, {id:'hr-7', title:'二次関数(I)'}, {id:'hr-8', title:'三角・指数・対数'}] },
    { id: 'u-analysis', title: '究極の解析学', category: '大学数学', price: 2500, prompt: '大学数学の解析。重積分や級数、ルベーグ積分。', units: [{id:'ua-1', title:'微分積分学'}, {id:'ua-2', title:'複素解析学'}, {id:'ua-3', title:'微分方程式'}, {id:'ua-4', title:'実解析学'}, {id:'ua-5', title:'関数解析学'}] },
    { id: 'u-algebra', title: '究極の代数学', category: '大学数学', price: 2500, prompt: '代数構造。ガロア理論や数論。', units: [{id:'ual-1', title:'線形代数学'}, {id:'ual-2', title:'群論'}, {id:'ual-3', title:'環論・体論'}, {id:'ual-4', title:'代数幾何学'}, {id:'ual-5', title:'数論'}] },
    { id: 'u-geometry', title: '究極の幾何学', category: '大学数学', price: 2500, prompt: '位相空間やリーマン幾何、トポロジー。', units: [{id:'ug-1', title:'集合と位相'}, {id:'ug-2', title:'微分幾何学'}, {id:'ug-3', title:'多様体論'}, {id:'ug-4', title:'トポロジー'}] },
    { id: 'u-applied', title: '究極の応用数学 セット', category: '大学数学', price: 2500, prompt: '統計、数値解析、離散数学。', units: [{id:'uap-1', title:'確率論'}, {id:'uap-2', title:'数理統計学'}, {id:'uap-3', title:'数値解析'}, {id:'uap-4', title:'離散数学'}] },
    { id: 'u-logic', title: '究極の数理論理学', category: '大学数学', price: 2250, prompt: '集合論、不完全性定理。数学の土台。', units: [{id:'ul-1', title:'数学序論'}, {id:'ul-2', title:'数学理論(不完全性定理)'}] },
];

const PRODUCTS = [
    ...CURRICULUM.map(c => ({...c, type: 'book'})),
    ...CURRICULUM.map(c => ({...c, id: `${c.id}-w`, type: 'workbook', title: `${c.title}【問題集】`, price: Math.floor(c.price * 1.1)}))
];

const CATEGORIES = ["すべて", "小学1年生", "小学2年生", "小学3年生", "小学4年生", "小学5年生", "小学6年生", "6年生復習用", "中学1年生", "中学2年生", "中学3年生", "中学復習用", "高校数学", "大学数学"];

// --- Icons ---
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const CalculatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>;
const ExamIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ShopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const CoffeeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// --- Components ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [lp, setLp] = useState(() => Number(localStorage.getItem('m_lp') || 500));
  const [lc, setLc] = useState(() => Number(localStorage.getItem('m_lc') || 0));
  const [owned, setOwned] = useState(() => JSON.parse(localStorage.getItem('m_owned') || '[]'));
  const [shopView, setShopView] = useState('map');
  const [filter, setFilter] = useState('すべて');
  const [cheatCode, setCheatCode] = useState('');

  const [lessonState, setLessonState] = useState({ topic: "", content: "", loading: false });
  const [drillState, setDrillState] = useState({ active: false, type: 'add', count: 10, currentIdx: 0, q: null, ans: "", score: 0, correct: 0 });
  const [examState, setExamState] = useState({ active: false, units: [], questions: [], idx: 0, loading: false, finished: false, score: 0 });

  useEffect(() => { localStorage.setItem('m_lp', lp.toString()); }, [lp]);
  useEffect(() => { localStorage.setItem('m_lc', lc.toString()); }, [lc]);
  useEffect(() => { localStorage.setItem('m_owned', JSON.stringify(owned)); }, [owned]);

  const buy = (p) => {
    if (lp >= p.price) { setLp(lp - p.price); setOwned([...owned, p.id]); }
    else alert('LPが足りません');
  };

  const applyCheat = () => {
    if (cheatCode === 'e271828') {
      setOwned(PRODUCTS.map(p => p.id));
      setCheatCode('');
      alert('すべてのライセンスを付与しました！');
    }
  };

  const exchange = (amt) => { if (lp >= amt * 100) { setLp(lp - amt * 100); setLc(lc + amt); } };

  // --- Calculator Training (復活/固定) ---
  const startDrill = (type, count) => generateDrillQuestion(type, count, 0, 0);

  const generateDrillQuestion = (type, count, idx, score) => {
    let a, b, q, correct;
    switch(type) {
      case 'add': a = rand(10, 99); b = rand(10, 99); q = `${a} + ${b}`; correct = a + b; break;
      case 'sub': a = rand(50, 99); b = rand(10, a); q = `${a} - ${b}`; correct = a - b; break;
      case 'mul': a = rand(2, 19); b = rand(2, 9); q = `${a} × ${b}`; correct = a * b; break;
      case 'div': b = rand(2, 9); correct = rand(2, 12); a = b * correct; q = `${a} ÷ ${b}`; break;
      case 'exp': a = rand(2, 15); q = `${a}²`; correct = a * a; break;
      case 'root': correct = rand(2, 15); a = correct * correct; q = `√${a}`; break;
    }
    setDrillState({ active: true, type, count, currentIdx: idx, q, ans: "", score, correct });
  };

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const submitDrill = () => {
    const isCorrect = parseInt(drillState.ans) === drillState.correct;
    const nextIdx = drillState.currentIdx + 1;
    const nextScore = isCorrect ? drillState.score + 1 : drillState.score;

    if (nextIdx < drillState.count) {
      generateDrillQuestion(drillState.type, drillState.count, nextIdx, nextScore);
    } else {
      const multiplier = (drillState.type === 'add' || drillState.type === 'sub') ? 1 : 1.5;
      const reward = Math.floor(nextScore * 5 * multiplier * (drillState.count / 10));
      setLp(prev => prev + reward);
      alert(`終了！スコア: ${nextScore}/${drillState.count}\n獲得LP: +${reward}`);
      setDrillState({ active: false, type: 'add', count: 10, currentIdx: 0, q: null, ans: "", score: 0, correct: 0 });
    }
  };

  const handleLessonStart = async (unit, product) => {
    setLessonState({ topic: unit.title, content: "", loading: true });
    setActiveTab('home');
    const res = await generateLesson(unit.title, product.category, product.prompt);
    setLessonState({ topic: unit.title, content: res, loading: false });
    // 読了報酬 100LP
    setLp(prev => prev + 100);
  };

  const handleExamStart = async (units, category) => {
    setExamState({ active: true, loading: true, units, questions: [], idx: 0, finished: false, score: 0 });
    setActiveTab('exam');
    const qs = await generateQuiz(units.map(u => u.title).join('・'), category);
    setExamState(prev => ({ ...prev, questions: qs, loading: false }));
  };

  const filteredBooks = PRODUCTS.filter(p => owned.includes(p.id) && (filter === 'すべて' || p.category === filter));
  const filteredShop = PRODUCTS.filter(p => (filter === 'すべて' || p.category === filter));

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden font-sans">
      <header className="h-14 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur z-50 shrink-0">
        <div className="font-bold flex items-center gap-2 text-accent text-lg"><SparklesIcon />Σxplore Math</div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end"><span className="text-[10px] font-bold text-slate-400">LP</span><span className="text-accent font-black">{lp.toLocaleString()}</span></div>
          <div className="flex flex-col items-end"><span className="text-[10px] font-bold text-yellow-600">LC</span><span className="text-yellow-600 font-black">{lc.toLocaleString()}</span></div>
        </div>
      </header>

      <nav className="flex border-b bg-white shrink-0">
        <TabButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<HomeIcon />} label="ホーム" />
        <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<CalculatorIcon />} label="計算特訓" />
        <TabButton active={activeTab === 'exam'} onClick={() => setActiveTab('exam')} icon={<ExamIcon />} label="演習" />
        <TabButton active={activeTab === 'bookshelf'} onClick={() => { setActiveTab('bookshelf'); setFilter('すべて'); }} icon={<BookIcon />} label="本棚" />
        <TabButton active={activeTab === 'shop'} onClick={() => { setActiveTab('shop'); setShopView('map'); setFilter('すべて'); }} icon={<ShopIcon />} label="ショップ" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="設定" />
      </nav>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'home' && (
          <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
            {!lessonState.topic ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-black">学習状況</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10">
                    <div className="text-slate-400 text-xs font-bold mb-2">総学習ライセンス</div>
                    <div className="text-4xl font-black text-accent">{owned.length} <span className="text-sm">冊</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                   <button onClick={() => setLessonState({topic:"", content:"", loading:false})} className="font-bold text-accent px-4 py-2 hover:bg-accent/5 rounded-full transition-colors">← 戻る</button>
                   <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+100 LP 獲得済</div>
                </div>
                {lessonState.loading ? <div className="space-y-4 animate-pulse"><div className="h-10 bg-slate-100 rounded-lg w-1/2"></div><div className="h-64 bg-slate-50 rounded-3xl"></div></div> : <MarkdownRenderer content={lessonState.content} />}
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            {!drillState.active ? (
              <div className="max-w-md w-full space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black">計算特訓</h2>
                  <p className="text-slate-500 text-sm">種目と問題数を選択してください</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['add','sub','mul','div','exp','root'].map(t => (
                    <button key={t} onClick={() => setDrillState(prev => ({...prev, type: t as any}))} className={`p-4 rounded-2xl border-2 font-bold transition-all ${drillState.type === t ? 'border-accent bg-accent text-white shadow-lg' : 'border-slate-100 hover:border-accent/30'}`}>
                      {t === 'add' ? '足し算' : t === 'sub' ? '引き算' : t === 'mul' ? '掛け算' : t === 'div' ? '割り算' : t === 'exp' ? 'べき乗' : '冪乗根'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[10, 25, 50].map(c => (
                    <button key={c} onClick={() => setDrillState(prev => ({...prev, count: c}))} className={`flex-1 py-3 rounded-xl border-2 font-bold ${drillState.count === c ? 'border-accent bg-accent/5 text-accent' : 'border-slate-100'}`}>
                      {c}問
                    </button>
                  ))}
                </div>
                <button onClick={() => startDrill(drillState.type, drillState.count)} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">特訓開始</button>
              </div>
            ) : (
              <div className="max-w-xs w-full space-y-12">
                <div className="flex justify-between items-center px-4">
                  <span className="font-mono font-bold text-slate-300">Q {drillState.currentIdx + 1}/{drillState.count}</span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-bold">SCORE: {drillState.score}</span>
                </div>
                <div className="text-7xl font-black font-mono tracking-tighter text-slate-800">{drillState.q}</div>
                <input autoFocus className="w-full p-6 text-center text-5xl font-mono border-4 border-slate-100 rounded-[2.5rem] focus:border-accent outline-none shadow-inner" value={drillState.ans} onChange={e => setDrillState({...drillState, ans: e.target.value})} onKeyDown={e => e.key === 'Enter' && submitDrill()} />
                <button onClick={submitDrill} className="w-full py-5 bg-accent text-white font-black rounded-3xl shadow-lg">回答</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exam' && (
          <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto w-full">
            {!examState.active ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-black">演習問題</h2>
                {owned.filter(o => o.endsWith('-w')).length === 0 ? <div className="py-20 text-center text-slate-400 font-bold">問題集ライセンスを所持していません。</div> : (
                  PRODUCTS.filter(p => p.type === 'workbook' && owned.includes(p.id)).map(p => (
                    <div key={p.id} className="p-6 bg-white rounded-3xl border shadow-sm space-y-4">
                       <div className="font-bold text-lg border-b pb-2">{p.title}</div>
                       <div className="grid grid-cols-2 gap-2">
                         {p.units?.map(u => (
                           <button key={u.id} onClick={() => handleExamStart([u], p.category)} className="p-3 text-left text-xs bg-slate-50 hover:bg-accent/5 hover:border-accent border rounded-xl transition-all">{u.title}</button>
                         ))}
                       </div>
                    </div>
                  ))
                )}
              </div>
            ) : examState.loading ? (
              <div className="h-full flex flex-col items-center justify-center animate-pulse gap-4 text-slate-400"><SparklesIcon /><span className="font-bold">AIが問題を作成中...</span></div>
            ) : examState.finished ? (
              <div className="text-center space-y-8 animate-in zoom-in duration-500">
                 <div className="text-6xl font-black text-accent">{examState.score} / {examState.questions.length}</div>
                 <button onClick={() => setExamState({ active: false, units: [], questions: [], idx: 0, loading: false, finished: false, score: 0 })} className="px-12 py-4 bg-slate-100 rounded-full font-bold hover:bg-slate-200">終了</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 bg-white rounded-[2rem] border shadow-sm relative overflow-hidden">
                   <div className="absolute top-4 right-6 text-xs font-bold text-slate-200">Q.{examState.idx+1}</div>
                   <MarkdownRenderer content={examState.questions[examState.idx]?.questionText} />
                </div>
                <input className="w-full p-5 rounded-2xl border-2 text-xl" placeholder="解答を入力..." value={examState.questions[examState.idx]?.userAnswer || ""} onChange={e => { const qs = [...examState.questions]; qs[examState.idx].userAnswer = e.target.value; setExamState({...examState, questions: qs}) }} />
                <button onClick={() => examState.idx < 19 ? setExamState({...examState, idx: examState.idx+1}) : setExamState({...examState, finished: true})} className="w-full py-5 bg-accent text-white font-bold rounded-2xl shadow-lg">{examState.idx === 19 ? '採点' : '次の問題'}</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookshelf' && (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 flex gap-2 overflow-x-auto shrink-0 border-b scrollbar-hide">
               {CATEGORIES.map(c => (
                 <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${filter === c ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{c}</button>
               ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
              {filteredBooks.length === 0 ? <div className="py-20 text-center text-slate-400 font-bold">該当する本がありません。</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBooks.map(p => (
                    <div key={p.id} className="p-8 bg-white rounded-[2.5rem] border shadow-sm hover:shadow-md transition-shadow group">
                      <div className="text-[10px] font-black tracking-widest text-slate-300 uppercase mb-2">{p.category}</div>
                      <h3 className="font-black text-xl mb-6 group-hover:text-accent transition-colors">{p.title}</h3>
                      <div className="space-y-2">
                        {p.units?.map(u => (
                          <button key={u.id} onClick={() => p.type === 'book' ? handleLessonStart(u, p) : handleExamStart([u], p.category)} className="w-full p-4 bg-slate-50 hover:bg-accent/5 text-left text-sm rounded-2xl border border-transparent hover:border-accent transition-all">{u.title}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="h-full overflow-y-auto">
            {shopView === 'map' ? (
              <div className="animate-in zoom-in duration-500 max-w-4xl mx-auto p-10">
                <h2 className="text-3xl font-black mb-10">マス・スクエア 2F フロアマップ</h2>
                <div className="relative w-full aspect-[16/9] bg-slate-50 rounded-[4rem] p-6 flex flex-col gap-6 border-8 border-white shadow-2xl overflow-hidden">
                  <div className="flex-1 flex gap-6">
                    <button onClick={() => setShopView('suurido')} className="flex-[2] bg-blue-50 rounded-[3rem] border-4 border-white shadow-lg flex flex-col items-center justify-center group hover:bg-blue-100 transition-all">
                      <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform"><BookIcon /></div>
                      <div className="font-black text-4xl text-blue-900">数理堂</div>
                    </button>
                    <div className="flex-1 flex flex-col gap-6">
                      <button onClick={() => setShopView('cafe')} className="flex-1 bg-orange-50 rounded-[3rem] border-4 border-white shadow-lg flex flex-col items-center justify-center group hover:bg-orange-100 transition-all">
                        <div className="text-orange-400 mb-2 group-hover:scale-110 transition-transform"><CoffeeIcon /></div>
                        <div className="font-black text-xl text-orange-900">数楽カフェ</div>
                      </button>
                      <button onClick={() => setShopView('exchange')} className="h-1/3 bg-emerald-50 rounded-[3rem] border-4 border-white shadow-lg flex items-center justify-center gap-3 group hover:bg-emerald-100 transition-all">
                        <div className="text-emerald-400 group-hover:rotate-12 transition-transform"><SparklesIcon /></div>
                        <div className="font-black text-emerald-900">両替所</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : shopView === 'suurido' ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 flex gap-4 items-center shrink-0 border-b">
                   <button onClick={() => setShopView('map')} className="p-2 bg-slate-100 rounded-full">←</button>
                   <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${filter === c ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{c}</button>
                      ))}
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredShop.map(p => (
                      <div key={p.id} className="p-8 bg-white rounded-[2.5rem] border shadow-sm flex flex-col justify-between group">
                        <div>
                          <div className="text-[10px] font-black text-slate-300 tracking-widest uppercase mb-2">{p.category}</div>
                          <h3 className="font-bold text-xl mb-1">{p.title}</h3>
                          <p className="text-xs text-slate-400 mb-6">{p.type === 'book' ? '参考書' : '問題集'}</p>
                        </div>
                        <div className="flex justify-between items-center border-t pt-6">
                           <div className="text-accent font-black text-2xl">{p.price} <span className="text-xs">LP</span></div>
                           <button disabled={owned.includes(p.id)} onClick={() => buy(p)} className="px-8 py-3 bg-accent text-white font-black rounded-2xl shadow-lg disabled:bg-slate-100 disabled:text-slate-300 transition-all">{owned.includes(p.id) ? '所持済' : '購入'}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : shopView === 'cafe' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <button onClick={() => setShopView('map')} className="absolute top-10 left-10 p-3 bg-slate-100 rounded-full">←</button>
                <div className="text-9xl mb-10 text-orange-100"><CoffeeIcon /></div>
                <h2 className="text-5xl font-black text-orange-900 mb-4 italic">数楽カフェ</h2>
                <div className="px-10 py-4 bg-orange-50 text-orange-600 rounded-full font-black tracking-widest uppercase text-sm border-2 border-orange-100">Coming Soon</div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right max-w-md mx-auto p-10">
                <button onClick={() => setShopView('map')} className="mb-6 p-3 bg-slate-100 rounded-full">←</button>
                <h2 className="text-3xl font-black mb-10 text-center">両替所</h2>
                <div className="p-10 bg-white rounded-[3rem] border shadow-2xl text-center space-y-10">
                   <p className="text-2xl font-black">100 LP  =  1 LC</p>
                   <button onClick={() => exchange(10)} className="w-full py-5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-2xl font-black transition-colors">10 LC に交換 (-1,000 LP)</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-10">
            <h2 className="text-3xl font-black">設定</h2>
            <div className="space-y-4 p-8 bg-slate-50 rounded-[2.5rem] border">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ライセンスコード入力</label>
               <div className="flex gap-2">
                 <input className="flex-1 p-4 rounded-xl border-2 focus:border-accent outline-none font-mono" placeholder="Code..." value={cheatCode} onChange={e => setCheatCode(e.target.value)} />
                 <button onClick={applyCheat} className="px-6 py-4 bg-slate-900 text-white font-bold rounded-xl">適用</button>
               </div>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-red-500 font-bold border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-colors">データをすべて消去する</button>
          </div>
        )}
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-accent' : 'text-slate-300 hover:text-slate-500'}`}>
    <span className={`transition-transform duration-300 ${active ? 'scale-125' : ''}`}>{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
