import { useState, useEffect } from "react";
import { Wheel } from 'react-custom-roulette';
import { db } from "./firebase";
import { doc, updateDoc, increment, addDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import "./App.css";

// პრიზების და ფერების კონფიგურაცია
const prizeData = [
  { option: 'შაურმა 🌯', style: { backgroundColor: '#ff4757', textColor: 'white' } }, // ინდექსი 0
  { option: 'კოკა-კოლა 🥤', style: { backgroundColor: '#ff6b81', textColor: 'white' } }, // ინდექსი 1
  { option: 'ფრი 🍟', style: { backgroundColor: '#ffa502', textColor: 'white' } },      // ინდექსი 2
  { option: 'წყალი 💧', style: { backgroundColor: '#1e90ff', textColor: 'white' } },     // ინდექსი 3
  { option: 'კომბო მენიუ 🎁', style: { backgroundColor: '#2ed573', textColor: 'white' } }, // ინდექსი 4
  { option: 'წაგება 😢', style: { backgroundColor: '#2f3542', textColor: 'white' } },      // ინდექსი 5
];

function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [history, setHistory] = useState([]);
  const [resultText, setResultText] = useState("დაატრიალე ბორბალი!");

  // ბაზიდან ისტორიის წამოღება რეალურ დროში
  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSpinClick = async () => {
    if (mustSpin) return;
    
    setResultText("მიმდინარეობს ტრიალი...");
    
    // ალბათობის ლოგიკა (1-დან 100-მდე შემთხვევითი რიცხვი)
    const randomChance = Math.floor(Math.random() * 100) + 1;
    let newPrizeNumber;

    if (randomChance === 1) {
      newPrizeNumber = 4; // კომბო მენიუ (1%)
    } else if (randomChance <= 3) {
      newPrizeNumber = 0; // შაურმა (2%)
    } else if (randomChance <= 9) {
      newPrizeNumber = 2; // ფრი (6%)
    } else if (randomChance <= 15) {
      newPrizeNumber = 3; // წყალი (6%)
    } else if (randomChance <= 21) {
      newPrizeNumber = 1; // კოკა-კოლა (6%)
    } else {
      newPrizeNumber = 5; // წაგება (79%)
    }

    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);

    // სტატისტიკის განახლება ბაზაში
    try {
      const statsRef = doc(db, "stats", "global");
      await updateDoc(statsRef, { totalSpins: increment(1) });
    } catch (error) {
      console.error("სტატისტიკის განახლების შეცდომა:", error);
    }
  };

  return (
    <div className="page-frame">
      <div className="app">
        <header>
          <h1>Lucky Wheel</h1>
        </header>
        
        <div className="main-layout">
          
          <div className="prizes-sidebar">
            <div className="prizes-preview">
              <p>ბორბალზეა:</p>
              <div className="prizes-badges">
                {prizeData.map((prize, index) => (
                  <span key={index} className="prize-badge" style={{ color: prize.style.backgroundColor }}>
                    {prize.option}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="content-area">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={prizeData}
              onStopSpinning={() => {
                setMustSpin(false);
                const wonPrize = prizeData[prizeNumber].option;
                setResultText(`შედეგი: ${wonPrize}`);
                
                if (wonPrize !== 'წაგება 😢') {
                  addDoc(collection(db, "history"), {
                    prize: wonPrize,
                    user: "მომხმარებელი",
                    createdAt: serverTimestamp()
                  });
                }
              }}
            />
              
            <button className="spin-btn" onClick={handleSpinClick} disabled={mustSpin}>
              დატრიალება
            </button>
            
            <h2 className="result-text">{resultText}</h2>
          </div>

          <div className="history-sidebar">
            <div className="history-section">
              <h3>ბოლო შედეგები</h3>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className="history-item">
                      <span>{item.user}:</span> <strong>{item.prize}</strong>
                    </div>
                  ))
                ) : (
                  <div className="history-item">ჯერჯერობით ცარიელია...</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;