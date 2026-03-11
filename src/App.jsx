import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, updateDoc, increment, getDoc, addDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import "./App.css";

function App() {
  const [result, setResult] = useState("გახსენი ყუთი!");
  const [history, setHistory] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);

  // ისტორიის წამოღება ბაზიდან
  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const spinBox = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult("მიმდინარეობს გახსნა...");

    const statsRef = doc(db, "stats", "global");
    await updateDoc(statsRef, { totalSpins: increment(1) });
    const statsSnap = await getDoc(statsRef);
    const count = statsSnap.data().totalSpins;

    let prize = "";
    
    // ლოგიკა: ყოველი მე-100 მომხმარებელი იგებს კომბოს
    if (count % 100 === 0) {
      prize = "კომბო მენიუ 🎁";
    } else {
      const rand = Math.random() * 100; // 0-დან 100-მდე რანდომი
      if (rand <= 0.1) prize = "შაურმა 12ლ 🌯";
      else if (rand <= 1.1) prize = "კოკა-კოლა 🥤";
      else if (rand <= 4.1) prize = "ფრი 🍟";
      else if (rand <= 9.1) prize = "წყალი 💧";
      else prize = "ამჟამად არ გაგიმართლათ 😢";
    }

    // შედეგის შენახვა ისტორიაში (მხოლოდ მოგების შემთხვევაში)
    if (prize !== "ამჟამად არ გაგიმართლათ 😢") {
      await addDoc(collection(db, "history"), {
        prize,
        user: `მომხმარებელი #${count}`,
        createdAt: serverTimestamp()
      });
    }

    // ანიმაციის იმიტაცია
    setTimeout(() => {
      setResult(prize);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="app">
      <h1>Lucky Box</h1>
      <div className={`box-container ${isSpinning ? "shaking" : ""}`}>
        <div className="box-icon">{isSpinning ? "📦" : "🎁"}</div>
      </div>
      
      <button className="spin-btn" onClick={spinBox} disabled={isSpinning}>
        გახსნა (1 დატრიალება)
      </button>

      <h2 className="result-text">{result}</h2>

      <div className="history-section">
        <h3>ბოლო 100 შედეგი</h3>
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <span>{item.user}:</span> <strong>{item.prize}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;