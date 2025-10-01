import React, { useState, useEffect } from 'react';  
import { Check, X, Plus, Trash2, Calendar, Users, Star, Award, Zap, Trophy, Home, CalendarDays, Settings } from 'lucide-react';

// Firebase imports  
import { initializeApp } from 'firebase/app';  
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Your existing Firebase configuration  
const firebaseConfig = {  
  apiKey: "AIzaSyBs2MkB1ORFZ7B1QPGUcWQuzgnFjb57-78",  
  authDomain: "chore-chart-5850a.firebaseapp.com",  
  projectId: "chore-chart-5850a",  
  storageBucket: "chore-chart-5850a.firebasestorage.app",  
  messagingSenderId: "489043096558",  
  appId: "1:489043096558:web:adf74662b56aed3946d4ff"  
};

// Initialize Firebase  
const app = initializeApp(firebaseConfig);  
const db = getFirestore(app);

const HousePointsChart = () => {  
  const [activeTab, setActiveTab] = useState('leaderboard');  
  const [houses] = useState(['Aetherwind', 'Emberfox', 'Drakonshade', 'Luminara']);  
   
  const [tasks, setTasks] = useState([  
    { id: 1, name: 'Complete Morning Chores', points: 10, category: 'Chores' },  
    { id: 2, name: 'Help Family Member', points: 15, category: 'Good Deeds' },  
    { id: 3, name: 'Clean Common Area', points: 12, category: 'Chores' },  
    { id: 4, name: 'Academic Excellence', points: 20, category: 'Studies' },  
    { id: 5, name: 'Show Kindness', points: 8, category: 'Good Deeds' },  
    { id: 6, name: 'Complete Weekly Quest', points: 25, category: 'Special' }  
  ]);

  const [completedTasks, setCompletedTasks] = useState({});  
  const [newTask, setNewTask] = useState({ name: '', points: 0, category: 'Chores' });  
  const [manualPoints, setManualPoints] = useState({});  
  const [pointInput, setPointInput] = useState('');  
  const [selectedHouse, setSelectedHouse] = useState('Aetherwind');  
  const [loading, setLoading] = useState(true);  
  const [bankLedger, setBankLedger] = useState([]);  
  const [convertHouse, setConvertHouse] = useState('Aetherwind');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Firebase real-time listeners  
  useEffect(() => {  
    const unsubscribeTasks = onSnapshot(doc(db, 'housePoints', 'tasks'), (doc) => {  
      if (doc.exists() && doc.data().tasks) {  
        setTasks(doc.data().tasks);  
      }  
      setLoading(false);  
    });

    const unsubscribeCompleted = onSnapshot(doc(db, 'housePoints', 'completedTasks'), (doc) => {  
      if (doc.exists() && doc.data().completed) {  
        setCompletedTasks(doc.data().completed);  
      }  
    });

    const unsubscribeManual = onSnapshot(doc(db, 'housePoints', 'manualPoints'), (doc) => {  
      if (doc.exists() && doc.data().points) {  
        setManualPoints(doc.data().points);  
      }  
    });

    const unsubscribeBank = onSnapshot(doc(db, 'housePoints', 'bankLedger'), (doc) => {  
      if (doc.exists() && doc.data().ledger) {  
        setBankLedger(doc.data().ledger);  
      }  
    });

    return () => {  
      unsubscribeTasks();  
      unsubscribeCompleted();  
      unsubscribeManual();  
      unsubscribeBank();  
    };  
  }, []);

  const saveTasksToFirebase = async (newTasks) => {  
    try {  
      await setDoc(doc(db, 'housePoints', 'tasks'), { tasks: newTasks });  
    } catch (error) {  
      console.error('Error saving tasks:', error);  
    }  
  };

  const saveCompletedToFirebase = async (completed) => {  
    try {  
      await setDoc(doc(db, 'housePoints', 'completedTasks'), { completed });  
    } catch (error) {  
      console.error('Error saving completed tasks:', error);  
    }  
  };

  const saveManualPointsToFirebase = async (points) => {  
    try {  
      await setDoc(doc(db, 'housePoints', 'manualPoints'), { points });  
    } catch (error) {  
      console.error('Error saving manual points:', error);  
    }  
  };

  const saveBankLedgerToFirebase = async (ledger) => {  
    try {  
      await setDoc(doc(db, 'housePoints', 'bankLedger'), { ledger });  
    } catch (error) {  
      console.error('Error saving bank ledger:', error);  
    }  
  };

  const toggleTask = (house, day, taskId) => {  
    const key = `${house}-${day}-${taskId}`;  
    const newCompleted = { ...completedTasks };  
    if (newCompleted[key]) {  
      delete newCompleted[key];  
    } else {  
      newCompleted[key] = true;  
    }  
    setCompletedTasks(newCompleted);  
    saveCompletedToFirebase(newCompleted);  
  };

  const addTask = () => {  
    if (newTask.name && newTask.points > 0) {  
      const newTasks = [...tasks, {  
        id: Date.now(),  
        name: newTask.name,  
        points: parseFloat(newTask.points),  
        category: newTask.category  
      }];  
      setTasks(newTasks);  
      saveTasksToFirebase(newTasks);  
      setNewTask({ name: '', points: 0, category: 'Chores' });  
    }  
  };

  const deleteTask = (taskId) => {  
    const newTasks = tasks.filter(task => task.id !== taskId);  
    setTasks(newTasks);  
    saveTasksToFirebase(newTasks);  
     
    const newCompleted = {};  
    Object.keys(completedTasks).forEach(key => {  
      if (!key.endsWith(`-${taskId}`)) {  
        newCompleted[key] = completedTasks[key];  
      }  
    });  
    setCompletedTasks(newCompleted);  
    saveCompletedToFirebase(newCompleted);  
  };

  const calculateHousePoints = (house, dayFilter = null) => {  
    let total = 0;  
     
    Object.keys(completedTasks).forEach(key => {  
      if (key.startsWith(house) && completedTasks[key]) {  
        const parts = key.split('-');  
        const day = parts[1];  
        const taskId = parseInt(parts[2]);  
         
        if (dayFilter === null || day === dayFilter) {  
          const task = tasks.find(t => t.id === taskId);  
          if (task) {  
            total += task.points;  
          }  
        }  
      }  
    });  
     
    if (dayFilter === null && manualPoints[house]) {  
      total += manualPoints[house];  
    }  
     
    return total;  
  };

  const addManualPoints = () => {  
    const points = parseInt(pointInput);  
    if (!isNaN(points) && points !== 0) {  
      const newManualPoints = {  
        ...manualPoints,  
        [selectedHouse]: (manualPoints[selectedHouse] || 0) + points  
      };  
      setManualPoints(newManualPoints);  
      saveManualPointsToFirebase(newManualPoints);  
      setPointInput('');  
    }  
  };

  const clearHousePoints = (house) => {  
    if (window.confirm(`Are you sure you want to clear ALL points for ${house}? This cannot be undone!`)) {  
      const newCompleted = {};  
      Object.keys(completedTasks).forEach(key => {  
        if (!key.startsWith(house)) {  
          newCompleted[key] = completedTasks[key];  
        }  
      });  
      setCompletedTasks(newCompleted);  
      saveCompletedToFirebase(newCompleted);  
       
      const newManualPoints = { ...manualPoints };  
      delete newManualPoints[house];  
      setManualPoints(newManualPoints);  
      saveManualPointsToFirebase(newManualPoints);  
    }  
  };

  const clearAllPoints = () => {  
    if (window.confirm('Are you sure you want to clear ALL points for ALL houses? This cannot be undone!')) {  
      setCompletedTasks({});  
      setManualPoints({});  
      saveCompletedToFirebase({});  
      saveManualPointsToFirebase({});  
    }  
  };

  const convertPointsToDollars = () => {  
    const housePoints = calculateHousePoints(convertHouse);  
    if (housePoints < 5) {  
      alert(`${convertHouse} has only ${housePoints} points. You need at least 5 points to convert.`);  
      return;  
    }  
    
    const dollars = Math.floor(housePoints / 5);
    const pointsToConvert = dollars * 5;
    const remainingPoints = housePoints % 5;  
     
    if (window.confirm(`Convert ${housePoints} points to $${dollars} for ${convertHouse}?\n\nThis will clear all points for ${convertHouse}.`)) {  
      const newEntry = {  
        id: Date.now(),  
        house: convertHouse,  
        points: housePoints,  
        dollars: dollars,  
        date: new Date().toISOString(),  
        paid: false  
      };  
       
      const newLedger = [newEntry, ...bankLedger];  
      setBankLedger(newLedger);  
      saveBankLedgerToFirebase(newLedger);  
       
      const newCompleted = {};  
      Object.keys(completedTasks).forEach(key => {  
        if (!key.startsWith(convertHouse)) {  
          newCompleted[key] = completedTasks[key];  
        }  
      });  
      setCompletedTasks(newCompleted);  
      saveCompletedToFirebase(newCompleted);  
       
      const newManualPoints = { ...manualPoints };  
      delete newManualPoints[convertHouse];  
      setManualPoints(newManualPoints);  
      saveManualPointsToFirebase(newManualPoints);  
    }  
  };

  const togglePaidStatus = (entryId) => {  
    const newLedger = bankLedger.map(entry =>  
      entry.id === entryId ? { ...entry, paid: !entry.paid } : entry  
    );  
    setBankLedger(newLedger);  
    saveBankLedgerToFirebase(newLedger);  
  };

  const deleteLedgerEntry = (entryId) => {  
    if (window.confirm('Delete this ledger entry?')) {  
      const newLedger = bankLedger.filter(entry => entry.id !== entryId);  
      setBankLedger(newLedger);  
      saveBankLedgerToFirebase(newLedger);  
    }  
  };

  const getTodayName = () => {  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];  
    return days[new Date().getDay()];  
  };

  const HouseEmblem = ({ house, size = 62 }) => {  
    const imageUrls = {  
      Aetherwind: "https://raw.githubusercontent.com/kevcourtright-art/4-houses/main/aetherwind.png",  
      Emberfox: "https://raw.githubusercontent.com/kevcourtright-art/4-houses/main/emberfox.png",  
      Drakonshade: "https://raw.githubusercontent.com/kevcourtright-art/4-houses/main/Drakonshade.png",  
      Luminara: "https://raw.githubusercontent.com/kevcourtright-art/4-houses/main/luminara.png"  
    };

    const houseColorBgs = {  
      Aetherwind: 'linear-gradient(135deg, #a855f7, #7c3aed)',  
      Emberfox: 'linear-gradient(135deg, #ef4444, #ea580c)',  
      Drakonshade: 'linear-gradient(135deg, #059669, #374151)',  
      Luminara: 'linear-gradient(135deg, #3b82f6, #06b6d4)'  
    };

    const fallbackEmojis = {  
      Aetherwind: '🦋',  
      Emberfox: '🦊',  
      Drakonshade: '🐉',  
      Luminara: '⭐'  
    };

    return (  
      <div style={{  
        width: `${size}px`,  
        height: `${size}px`,  
        background: houseColorBgs[house],  
        borderRadius: '50%',  
        border: '4px solid #fbbf24',  
        display: 'flex',  
        alignItems: 'center',  
        justifyContent: 'center',  
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',  
        overflow: 'visible'  
      }}>  
        <img  
          src={imageUrls[house]}  
          alt={`${house} emblem`}  
          style={{  
            width: `${size - 8}px`,  
            height: `${size - 8}px`,  
            objectFit: 'contain',  
            borderRadius: '50%'  
          }}  
          onError={(e) => {  
            e.target.style.display = 'none';  
            e.target.nextSibling.style.display = 'block';  
          }}  
        />  
        <div style={{  
          color: 'white',  
          textAlign: 'center',  
          fontSize: '24px',  
          display: 'none'  
        }}>  
          {fallbackEmojis[house]}  
        </div>  
      </div>  
    );  
  };

  const houseColors = {  
    Aetherwind: {  
      gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',  
      light: '#f3e8ff',  
      border: '#c4b5fd',  
      text: '#6d28d9'  
    },  
    Emberfox: {  
      gradient: 'linear-gradient(135deg, #dc2626, #ea580c)',  
      light: '#fee2e2',  
      border: '#fca5a5',  
      text: '#b91c1c'  
    },  
    Drakonshade: {  
      gradient: 'linear-gradient(135deg, #059669, #374151)',  
      light: '#d1fae5',  
      border: '#86efac',  
      text: '#047857'  
    },  
    Luminara: {  
      gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',  
      light: '#dbeafe',  
      border: '#93c5fd',  
      text: '#1d4ed8'  
    }  
  };

  const sortedHouses = houses.map(house => ({  
    name: house,  
    points: calculateHousePoints(house)  
  })).sort((a, b) => b.points - a.points);

  if (loading) {  
    return (  
      <div style={{  
        minHeight: '100vh',  
        background: 'linear-gradient(135deg, #1e1b4b, #7c3aed, #ec4899)',  
        display: 'flex',  
        alignItems: 'center',  
        justifyContent: 'center',  
        color: 'white',  
        fontSize: '1.5rem'  
      }}>  
        Loading House Points...  
      </div>  
    );  
  }

  const TabNav = () => (  
    <div style={{  
      display: 'grid',  
      gridTemplateColumns: 'repeat(5, 1fr)',  
      gap: '0',  
      marginBottom: '32px',  
      borderRadius: '12px',  
      overflow: 'hidden',  
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'  
    }}>  
      <button  
        onClick={() => setActiveTab('leaderboard')}  
        style={{  
          padding: '16px',  
          background: activeTab === 'leaderboard' ? 'white' : '#fde68a',  
          border: 'none',  
          cursor: 'pointer',  
          fontWeight: activeTab === 'leaderboard' ? 'bold' : 'normal',  
          color: '#92400e',  
          display: 'flex',  
          alignItems: 'center',  
          justifyContent: 'center',  
          gap: '8px',  
          fontSize: '14px',  
          transition: 'all 0.2s',  
          borderBottom: activeTab === 'leaderboard' ? '3px solid #f59e0b' : 'none'  
        }}  
      >  
        <Trophy size={18} />  
        Leaderboard  
      </button>  
      <button  
        onClick={() => setActiveTab('today')}  
        style={{  
          padding: '16px',  
          background: activeTab === 'today' ? 'white' : '#fde68a',  
          border: 'none',  
          cursor: 'pointer',  
          fontWeight: activeTab === 'today' ? 'bold' : 'normal',  
          color: '#92400e',  
          display: 'flex',  
          alignItems: 'center',  
          justifyContent: 'center',  
          gap: '8px',  
          fontSize: '14px',  
          transition: 'all 0.2s',  
          borderBottom: activeTab === 'today' ? '3px solid #f59e0b' : 'none'  
        }}  
      >  
        <Home size={18} />  
        Today  
      </button>  
      <button  
        onClick={() => setActiveTab('week')}  
        style={{  
          padding: '16px',  
          background: activeTab === 'week' ? 'white' : '#fde68a',  
          border: 'none',  
          cursor: 'pointer',  
          fontWeight: activeTab === 'week' ? 'bold' : 'normal',  
          color: '#92400e',  
          display: 'flex',  
          alignItems: 'center',  
          justifyContent: 'center',  
          gap: '8px',  
          fontSize: '14px',  
          transition: 'all 0.2s',  
          borderBottom: activeTab === 'week' ? '3px solid #f59e0b' : 'none'  
        }}  
      >  
        <CalendarDays size={18} />  
        This Week  
      </button>  
      <button  
        onClick={() => setActiveTab('admin')}  
        style={{  
          padding: '16px',  
          background: activeTab === 'admin' ? 'white' : '#fde68a',  
          border: 'none',  
          cursor: 'pointer',  
          fontWeight: activeTab === 'admin' ? 'bold' : 'normal',  
          color: '#92400e',  
          display: 'flex',  
          alignItems: 'center',  
          justifyContent: 'center',  
          gap: '8px',  
          fontSize: '14px',  
          transition: 'all 0.2s',  
          borderBottom: activeTab === 'admin' ? '3px solid #f59e0b' : 'none'  
        }}  
      >  
        <Settings size={18} />  
        Admin  
      </button>  
      <button  
        onClick={() => setActiveTab('bank')}  
        style={{  
          padding: '16px',  
          background: activeTab === 'bank' ? 'white' : '#fde68a',  
          border: 'none',  
          cursor: 'pointer',  
          fontWeight: activeTab === 'bank' ? 'bold' : 'normal',  
          color: '#92400e',  
          display: 'flex',  
          alignItems: 'center',  
          justifyContent: 'center',  
          gap: '8px',  
          fontSize: '14px',  
          transition: 'all 0.2s',  
          borderBottom: activeTab === 'bank' ? '3px solid #f59e0b' : 'none'  
        }}  
      >  
        <Award size={18} />  
        Bank  
      </button>  
    </div>  
  );

  const LeaderboardTab = () => (  
    <div>  
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>  
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>  
          House Standings  
        </h2>  
        <p style={{ color: '#a16207' }}>Current competition rankings</p>  
      </div>  
      <div style={{  
        display: 'grid',  
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',  
        gap: '24px'  
      }}>  
        {sortedHouses.map((house, index) => {  
          const colors = houseColors[house.name];  
          const isWinning = index === 0;  
          return (  
            <div key={house.name} style={{  
              background: colors.gradient,  
              borderRadius: '16px',  
              padding: '24px',  
              paddingTop: '180px',  
              color: 'white',  
              boxShadow: isWinning ? '0 12px 24px rgba(251, 191, 36, 0.4)' : '0 8px 16px rgba(0,0,0,0.2)',  
              transform: isWinning ? 'scale(1.05)' : 'scale(1)',  
              transition: 'transform 0.2s, box-shadow 0.2s',  
              border: isWinning ? '4px solid #fbbf24' : 'none',  
              position: 'relative',  
              minHeight: '500px'  
            }}>  
              {isWinning && (  
                <div style={{  
                  position: 'absolute',  
                  top: '-8px',  
                  left: '50%',  
                  transform: 'translateX(-50%)',  
                  background: '#fbbf24',  
                  color: '#92400e',  
                  padding: '4px 12px',  
                  borderRadius: '12px',  
                  fontSize: '0.75rem',  
                  fontWeight: 'bold'  
                }}>  
                  LEADING  
                </div>  
              )}  
              <div style={{ textAlign: 'center' }}>  
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>  
                  <HouseEmblem house={house.name} size={250} />  
                </div>  
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>  
                  {house.name}  
                </h3>  
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>  
                  {house.points}  
                </div>  
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>House Points</div>  
                {isWinning && house.points > 0 && (  
                  <div style={{ marginTop: '8px', color: '#fef08a', fontWeight: 'bold' }}>  
                    Leading House!  
                  </div>  
                )}  
              </div>  
            </div>  
          );  
        })}  
      </div>  
    </div>  
  );

  const TodayTab = () => {  
    const today = getTodayName();  
    return (  
      <div>  
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>  
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>  
            Today's Activities - {today}  
          </h2>  
          <p style={{ color: '#a16207' }}>Track today's house deeds and points</p>  
        </div>  
         
        {houses.map((house) => {  
          const colors = houseColors[house];  
          const dayCompletedTasks = tasks.filter(task =>  
            completedTasks[`${house}-${today}-${task.id}`]  
          );  
           
          return (  
            <div key={house} style={{  
              background: colors.gradient,  
              borderRadius: '16px',  
              padding: '20px',  
              marginBottom: '16px',  
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',  
              border: `3px solid ${colors.border}`  
            }}>  
              <div style={{  
                display: 'flex',  
                alignItems: 'center',  
                justifyContent: 'space-between',  
                marginBottom: '16px'  
              }}>  
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>  
                  <HouseEmblem house={house} size={175} />  
                  <div>  
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>  
                      {house}  
                    </h3>  
                  </div>  
                </div>  
                 
                <select  
                  onChange={(e) => {  
                    const taskId = parseInt(e.target.value);  
                    if (taskId) {  
                      toggleTask(house, today, taskId);  
                      e.target.value = '';  
                    }  
                  }}  
                  style={{  
                    padding: '8px 12px',  
                    border: `2px solid ${colors.border}`,  
                    borderRadius: '8px',  
                    fontSize: '14px',  
                    background: 'white'  
                  }}  
                >  
                  <option value="">Add deed...</option>  
                  {tasks.map(task => (  
                    <option key={task.id} value={task.id}>  
                      {task.name} (+{task.points}pts)  
                    </option>  
                  ))}  
                </select>  
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>  
                {dayCompletedTasks.map(task => (  
                  <div key={task.id} style={{  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'space-between',  
                    padding: '12px',  
                    borderRadius: '8px',  
                    background: 'rgba(255,255,255,0.2)',  
                    border: '1px solid rgba(255,255,255,0.3)'  
                  }}>  
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>  
                      <Check size={16} color="#16a34a" />  
                      <span style={{ fontSize: '1rem', fontWeight: '500', color: 'white' }}>  
                        {task.name}  
                      </span>  
                    </div>  
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>  
                      <Star size={14} color="#ca8a04" />  
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>+{task.points}</span>  
                      <button  
                        onClick={() => toggleTask(house, today, task.id)}  
                        style={{  
                          background: 'none',  
                          border: 'none',  
                          color: '#dc2626',  
                          cursor: 'pointer',  
                          padding: '4px'  
                        }}  
                      >  
                        <X size={16} />  
                      </button>  
                    </div>  
                  </div>  
                ))}  
              </div>  
            </div>  
          );  
        })}  
      </div>  
    );  
  };

  const WeekTab = () => (  
    <div>  
      <div style={{  
        display: 'flex',  
        alignItems: 'center',  
        gap: '12px',  
        marginBottom: '24px',  
        justifyContent: 'center'  
      }}>  
        <Calendar size={32} color="#92400e" />  
        <h2 style={{  
          fontSize: '2rem',  
          fontWeight: 'bold',  
          color: '#92400e'  
        }}>  
          Weekly House Activities  
        </h2>  
        <Zap size={32} color="#92400e" />  
      </div>

      <div style={{ overflowX: 'auto' }}>  
        <div style={{ minWidth: '100%' }}>  
          <div style={{  
            display: 'grid',  
            gridTemplateColumns: '150px repeat(7, 1fr)',  
            gap: '12px',  
            marginBottom: '16px'  
          }}>  
            <div style={{  
              fontWeight: 'bold',  
              color: '#92400e',  
              fontSize: '0.875rem',  
              padding: '12px',  
              display: 'flex',  
              alignItems: 'center',  
              background: '#fde68a',  
              borderRadius: '12px'  
            }}>  
              Houses  
            </div>  
            {daysOfWeek.map(day => (  
              <div key={day} style={{  
                fontWeight: 'bold',  
                color: '#92400e',  
                textAlign: 'center',  
                padding: '12px',  
                background: '#fde68a',  
                borderRadius: '12px'  
              }}>  
                <div style={{ fontSize: '1.125rem' }}>{day}</div>  
                <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: '4px' }}>  
                  {(() => {  
                    const today = new Date();  
                    const currentDay = today.getDay();  
                    const dayIndex = daysOfWeek.indexOf(day);  
                    const daysFromToday = dayIndex - currentDay;  
                    const targetDate = new Date(today);  
                    targetDate.setDate(today.getDate() + daysFromToday);  
                    return targetDate.getDate();  
                  })()}  
                </div>  
              </div>  
            ))}  
          </div>

          {houses.map((house) => {  
            const colors = houseColors[house];  
            return (  
              <div key={house} style={{  
                display: 'grid',  
                gridTemplateColumns: '150px repeat(7, 1fr)',  
                gap: '12px',  
                marginBottom: '12px'  
              }}>  
                <div style={{  
                  padding: '16px',  
                  background: colors.gradient,  
                  borderRadius: '12px',  
                  color: 'white',  
                  display: 'flex',  
                  alignItems: 'center',  
                  justifyContent: 'center'  
                }}>  
                  <HouseEmblem house={house} size={100} />  
                </div>

                {daysOfWeek.map(day => {  
                  const dayCompletedTasks = tasks.filter(task =>  
                    completedTasks[`${house}-${day}-${task.id}`]  
                  );  
                   
                  return (  
                    <div key={day} style={{  
                      padding: '8px',  
                      background: 'white',  
                      borderRadius: '12px',  
                      border: '2px solid #fde68a',  
                      minHeight: '80px'  
                    }}>  
                      <div style={{ marginBottom: '8px' }}>  
                        <select  
                          onChange={(e) => {  
                            const taskId = parseInt(e.target.value);  
                            if (taskId) {  
                              toggleTask(house, day, taskId);  
                              e.target.value = '';  
                            }  
                          }}  
                          style={{  
                            width: '100%',  
                            fontSize: '0.75rem',  
                            padding: '4px 8px',  
                            border: '1px solid #fbbf24',  
                            borderRadius: '6px',  
                            background: 'white'  
                          }}  
                        >  
                          <option value="">Add deed...</option>  
                          {tasks.map(task => (  
                            <option key={task.id} value={task.id}>  
                              {task.name} (+{task.points}pts)  
                            </option>  
                          ))}  
                        </select>  
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>  
                        {dayCompletedTasks.map(task => (  
                          <div key={task.id} style={{  
                            display: 'flex',  
                            alignItems: 'center',  
                            justifyContent: 'space-between',  
                            padding: '4px',  
                            borderRadius: '4px',  
                            background: colors.light,  
                            border: `1px solid ${colors.border}`  
                          }}>  
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>  
                              <Check size={12} color="#16a34a" />  
                              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>  
                                {task.name}  
                              </span>  
                            </div>  
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>  
                              <Star size={10} color="#ca8a04" />  
                              <span style={{ fontSize: '0.75rem' }}>+{task.points}</span>  
                              <button  
                                onClick={() => toggleTask(house, day, task.id)}  
                                style={{  
                                  background: 'none',  
                                  border: 'none',  
                                  color: '#dc2626',  
                                  cursor: 'pointer',  
                                  marginLeft: '4px'  
                                }}  
                              >  
                                <X size={12} />  
                              </button>  
                            </div>  
                          </div>  
                        ))}  
                      </div>  
                    </div>  
                  );  
                })}  
              </div>  
            );  
          })}  
        </div>  
      </div>  
    </div>  
  );

  const AdminTab = () => (  
    <div>  
      <div style={{  
        display: 'flex',  
        alignItems: 'center',  
        gap: '12px',  
        marginBottom: '24px',  
        justifyContent: 'center'  
      }}>  
        <Users size={32} color="#92400e" />  
        <h2 style={{  
          fontSize: '2rem',  
          fontWeight: 'bold',  
          color: '#92400e'  
        }}>  
          Manage House Activities  
        </h2>  
      </div>  
       
      <div style={{  
        background: 'linear-gradient(to right, #fef3c7, #fde68a)',  
        borderRadius: '16px',  
        padding: '24px',  
        marginBottom: '24px',  
        border: '2px solid #fbbf24'  
      }}>  
        <h3 style={{  
          fontSize: '1.125rem',  
          fontWeight: '600',  
          color: '#92400e',  
          marginBottom: '16px',  
          display: 'flex',  
          alignItems: 'center',  
          gap: '8px'  
        }}>  
          <Plus size={20} />  
          Create New House Activity  
        </h3>  
        <div style={{  
          display: 'grid',  
          gridTemplateColumns: '1fr auto auto auto',  
          gap: '16px',  
          alignItems: 'end'  
        }}>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#92400e',  
              marginBottom: '8px'  
            }}>  
              Activity Name  
            </label>  
            <input  
              type="text"  
              value={newTask.name}  
              onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}  
              style={{  
                width: '100%',  
                padding: '12px 16px',  
                border: '2px solid #fde68a',  
                borderRadius: '12px',  
                fontSize: '14px'  
              }}  
              placeholder="What deed or task?"  
            />  
          </div>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#92400e',  
              marginBottom: '8px'  
            }}>  
              Points Value  
            </label>  
            <input  
              type="number"  
              value={newTask.points || ''}  
              onChange={(e) => setNewTask(prev => ({ ...prev, points: parseFloat(e.target.value) || 0 }))}  
              style={{  
                width: '100%',  
                padding: '12px 16px',  
                border: '2px solid #fde68a',  
                borderRadius: '12px',  
                fontSize: '14px'  
              }}  
              placeholder="0"  
              min="0"  
              step="1"  
            />  
          </div>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#92400e',  
              marginBottom: '8px'  
            }}>  
              Category  
            </label>  
            <select  
              value={newTask.category}  
              onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}  
              style={{  
                width: '100%',  
                padding: '12px 16px',  
                border: '2px solid #fde68a',  
                borderRadius: '12px',  
                fontSize: '14px',  
                background: 'white'  
              }}  
            >  
              <option value="Chores">Chores</option>  
              <option value="Good Deeds">Good Deeds</option>  
              <option value="Studies">Studies</option>  
              <option value="Special">Special</option>  
            </select>  
          </div>  
          <button  
            onClick={addTask}  
            style={{  
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',  
              color: 'white',  
              border: 'none',  
              padding: '12px 24px',  
              borderRadius: '12px',  
              cursor: 'pointer',  
              fontWeight: 'bold',  
              display: 'flex',  
              alignItems: 'center',  
              gap: '8px',  
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'  
            }}  
          >  
            <Plus size={16} />  
            Add Activity  
          </button>  
        </div>  
      </div>

      <div style={{  
        background: 'linear-gradient(to right, #fee2e2, #fecaca)',  
        borderRadius: '16px',  
        padding: '24px',  
        marginBottom: '24px',  
        border: '2px solid #f87171'  
      }}>  
        <h3 style={{  
          fontSize: '1.125rem',  
          fontWeight: '600',  
          color: '#b91c1c',  
          marginBottom: '16px',  
          display: 'flex',  
          alignItems: 'center',  
          gap: '8px'  
        }}>  
          Manual Point Adjustment & Clearing  
        </h3>  
        <div style={{  
          display: 'grid',  
          gridTemplateColumns: 'auto 1fr auto 1fr',  
          gap: '16px',  
          alignItems: 'end',  
          marginBottom: '16px'  
        }}>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#b91c1c',  
              marginBottom: '8px'  
            }}>  
              House  
            </label>  
            <select  
              value={selectedHouse}  
              onChange={(e) => setSelectedHouse(e.target.value)}  
              style={{  
                padding: '12px 16px',  
                border: '2px solid #fecaca',  
                borderRadius: '12px',  
                fontSize: '14px',  
                background: 'white'  
              }}  
            >  
              {houses.map(house => (  
                <option key={house} value={house}>{house}</option>  
              ))}  
            </select>  
          </div>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#b91c1c',  
              marginBottom: '8px'  
            }}>  
              Points (use negative numbers to subtract)  
            </label>  
            <input  
              type="number"  
              value={pointInput}  
              onChange={(e) => setPointInput(e.target.value)}  
              style={{  
                width: '100%',  
                padding: '12px 16px',  
                border: '2px solid #fecaca',  
                borderRadius: '12px',  
                fontSize: '14px'  
              }}  
              placeholder="Enter points (+/-)"  
            />  
          </div>  
          <button  
            onClick={addManualPoints}  
            style={{  
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',  
              color: 'white',  
              border: 'none',  
              padding: '12px 24px',  
              borderRadius: '12px',  
              cursor: 'pointer',  
              fontWeight: 'bold',  
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'  
            }}  
          >  
            Adjust Points  
          </button>  
          <div>  
            <label style={{  
              display: 'block',  
              fontSize: '0.875rem',  
              fontWeight: '500',  
              color: '#b91c1c',  
              marginBottom: '8px'  
            }}>  
              Clear Points  
            </label>  
            <select  
              onChange={(e) => {  
                if (e.target.value === 'all') {  
                  clearAllPoints();  
                } else if (e.target.value) {  
                  clearHousePoints(e.target.value);  
                }  
                e.target.value = '';  
              }}  
              style={{  
                padding: '12px 16px',  
                border: '2px solid #fecaca',  
                borderRadius: '12px',  
                fontSize: '14px',  
                background: 'white'  
              }}  
            >  
              <option value="">Choose to clear...</option>  
              {houses.map(house => (  
                <option key={house} value={house}>Clear {house}</option>  
              ))}  
              <option value="all">Clear ALL Houses</option>  
            </select>  
          </div>  
        </div>  
        <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>  
          Use this to add bonus points or penalties that aren't tied to specific deeds. You can also clear points for individual houses or all houses at once.  
        </div>  
      </div>

      <div>  
        <h3 style={{  
          fontSize: '1.25rem',  
          fontWeight: 'bold',  
          color: '#92400e',  
          marginBottom: '16px'  
        }}>  
          Current Activities  
        </h3>  
        <div style={{  
          display: 'grid',  
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',  
          gap: '16px'  
        }}>  
          {tasks.map((task) => {  
            const categoryColors = {  
              'Chores': { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },  
              'Good Deeds': { bg: '#d1fae5', border: '#6ee7b7', text: '#047857' },  
              'Studies': { bg: '#f3e8ff', border: '#c4b5fd', text: '#6d28d9' },  
              'Special': { bg: '#fef3c7', border: '#fde68a', text: '#92400e' }  
            };  
            const colors = categoryColors[task.category];  
            return (  
              <div key={task.id} style={{  
                background: colors.bg,  
                border: `2px solid ${colors.border}`,  
                color: colors.text,  
                borderRadius: '16px',  
                padding: '16px',  
                display: 'flex',  
                alignItems: 'center',  
                justifyContent: 'space-between',  
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'  
              }}>  
                <div>  
                  <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{task.name}</h4>  
                  <p style={{  
                    fontWeight: '600',  
                    display: 'flex',  
                    alignItems: 'center',  
                    gap: '4px'  
                  }}>  
                    <Star size={16} />  
                    {task.points} points  
                  </p>  
                  <span style={{  
                    fontSize: '0.75rem',  
                    padding: '2px 8px',  
                    borderRadius: '50px',  
                    background: 'rgba(255,255,255,0.5)'  
                  }}>  
                    {task.category}  
                  </span>  
                </div>  
                <button  
                  onClick={() => deleteTask(task.id)}  
                  style={{  
                    color: '#dc2626',  
                    background: 'white',  
                    borderRadius: '50%',  
                    padding: '8px',  
                    border: 'none',  
                    cursor: 'pointer',  
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'  
                  }}  
                >  
                  <Trash2 size={18} />  
                </button>  
              </div>  
            );  
          })}  
        </div>  
      </div>  
    </div>  
  );

  const BankTab = () => {  
    const totalUnpaid = bankLedger  
      .filter(entry => !entry.paid)  
      .reduce((sum, entry) => sum + entry.dollars, 0);

    return (  
      <div>  
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>  
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>  
            House Bank  
          </h2>  
          <p style={{ color: '#a16207' }}>Convert points to dollars (5 points = $1)</p>  
        </div>

        <div style={{  
          background: 'linear-gradient(to right, #d1fae5, #a7f3d0)',  
          borderRadius: '16px',  
          padding: '24px',  
          marginBottom: '24px',  
          border: '2px solid #6ee7b7'  
        }}>  
          <h3 style={{  
            fontSize: '1.125rem',  
            fontWeight: '600',  
            color: '#065f46',  
            marginBottom: '16px'  
          }}>  
            Convert Points to Dollars  
          </h3>  
           
          <div style={{  
            display: 'grid',  
            gridTemplateColumns: '1fr auto auto',  
            gap: '16px',  
            alignItems: 'end'  
          }}>  
            <div>  
              <label style={{  
                display: 'block',  
                fontSize: '0.875rem',  
                fontWeight: '500',  
                color: '#065f46',  
                marginBottom: '8px'  
              }}>  
                Select House  
              </label>  
              <select  
                value={convertHouse}  
                onChange={(e) => setConvertHouse(e.target.value)}  
                style={{  
                  width: '100%',  
                  padding: '12px 16px',  
                  border: '2px solid #a7f3d0',  
                  borderRadius: '12px',  
                  fontSize: '14px',  
                  background: 'white'  
                }}  
              >  
                {houses.map(house => (  
                  <option key={house} value={house}>  
                    {house} - {calculateHousePoints(house)} points (${calculateHousePoints(house) / 5})  
                  </option>  
                ))}  
              </select>  
            </div>  
             
            <div style={{  
              background: 'white',  
              padding: '12px 20px',  
              borderRadius: '12px',  
              border: '2px solid #6ee7b7'  
            }}>  
              <div style={{ fontSize: '0.75rem', color: '#065f46', marginBottom: '4px' }}>  
                Will Convert To  
              </div>  
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>  
                ${calculateHousePoints(convertHouse) / 5}  
              </div>  
            </div>

            <button  
              onClick={convertPointsToDollars}  
              style={{  
                background: 'linear-gradient(135deg, #059669, #047857)',  
                color: 'white',  
                border: 'none',  
                padding: '12px 24px',  
                borderRadius: '12px',  
                cursor: 'pointer',  
                fontWeight: 'bold',  
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',  
                fontSize: '14px'  
              }}  
            >  
              Convert to Bank  
            </button>  
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.875rem', color: '#065f46' }}>  
            Note: Only complete groups of 5 points will be converted. Any remaining points (less than 5) will stay with the house.
            <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '8px' }}>
              <strong>Debug Info:</strong><br/>
              {convertHouse} Total Points: {calculateHousePoints(convertHouse)}<br/>
              {convertHouse} Manual Points: {manualPoints[convertHouse] || 0}<br/>
              Will Convert: {Math.floor(calculateHousePoints(convertHouse) / 5) * 5} points to ${Math.floor(calculateHousePoints(convertHouse) / 5)}<br/>
              Will Remain: {calculateHousePoints(convertHouse) - (Math.floor(calculateHousePoints(convertHouse) / 5) * 5)} points
            </div>
          </div>  
        </div>

        <div style={{  
          display: 'grid',  
          gridTemplateColumns: 'repeat(2, 1fr)',  
          gap: '16px',  
          marginBottom: '24px'  
        }}>  
          <div style={{  
            background: 'white',  
            padding: '20px',  
            borderRadius: '12px',  
            border: '2px solid #fde68a',  
            textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '8px' }}>  
              Total Unpaid  
            </div>  
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>  
              ${totalUnpaid.toFixed(0)}  
            </div>  
          </div>  
          <div style={{  
            background: 'white',  
            padding: '20px',  
            borderRadius: '12px',  
            border: '2px solid #fde68a',  
            textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '8px' }}>  
              Total Entries  
            </div>  
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>  
              {bankLedger.length}  
            </div>  
          </div>  
        </div>

        <div>  
          <h3 style={{  
            fontSize: '1.25rem',  
            fontWeight: 'bold',  
            color: '#92400e',  
            marginBottom: '16px'  
          }}>  
            Bank Ledger  
          </h3>

          {bankLedger.length === 0 ? (  
            <div style={{  
              background: 'white',  
              padding: '40px',  
              borderRadius: '12px',  
              textAlign: 'center',  
              color: '#999'  
            }}>  
              No transactions yet. Convert house points to start building the bank!  
            </div>  
          ) : (  
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>  
              {bankLedger.map(entry => {  
                const colors = houseColors[entry.house];  
                const entryDate = new Date(entry.date);  
                return (  
                  <div key={entry.id} style={{  
                    background: 'white',  
                    padding: '16px',  
                    borderRadius: '12px',  
                    border: `2px solid ${entry.paid ? '#86efac' : colors.border}`,  
                    display: 'flex',  
                    alignItems: 'center',  
                    justifyContent: 'space-between',  
                    opacity: entry.paid ? 0.6 : 1  
                  }}>  
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>  
                      <HouseEmblem house={entry.house} size={48} />  
                      <div>  
                        <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: colors.text }}>  
                          {entry.house}  
                        </div>  
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>  
                          {entryDate.toLocaleDateString()} at {entryDate.toLocaleTimeString()}  
                        </div>  
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>  
                          {entry.points} points → ${entry.dollars}  
                        </div>  
                      </div>  
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>  
                      <div style={{  
                        fontSize: '1.5rem',  
                        fontWeight: 'bold',  
                        color: entry.paid ? '#059669' : '#dc2626'  
                      }}>  
                        ${entry.dollars}  
                      </div>

                      <button  
                        onClick={() => togglePaidStatus(entry.id)}  
                        style={{  
                          padding: '8px 16px',  
                          borderRadius: '8px',  
                          border: 'none',  
                          cursor: 'pointer',  
                          fontWeight: 'bold',  
                          fontSize: '0.875rem',  
                          background: entry.paid ? '#d1fae5' : '#fef3c7',  
                          color: entry.paid ? '#065f46' : '#92400e'  
                        }}  
                      >  
                        {entry.paid ? 'Paid ✓' : 'Mark Paid'}  
                      </button>

                      <button  
                        onClick={() => deleteLedgerEntry(entry.id)}  
                        style={{  
                          color: '#dc2626',  
                          background: 'white',  
                          borderRadius: '50%',  
                          padding: '8px',  
                          border: '1px solid #fca5a5',  
                          cursor: 'pointer'  
                        }}  
                      >  
                        <Trash2 size={16} />  
                      </button>  
                    </div>  
                  </div>  
                );  
              })}  
            </div>  
          )}  
        </div>  
      </div>  
    );  
  };

  return (  
    <div style={{  
      minHeight: '100vh',  
      background: 'linear-gradient(135deg, #1e1b4b, #7c3aed, #ec4899)',  
      padding: '24px'  
    }}>  
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>  
        <div style={{  
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',  
          borderRadius: '24px',  
          padding: '32px',  
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)'  
        }}>  
           
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>  
            <h1 style={{  
              fontSize: '3rem',  
              fontWeight: 'bold',  
              color: '#1f2937',  
              marginBottom: '8px'  
            }}>  
              House Points Championship  
            </h1>  
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>  
              Magical House Competition  
            </p>  
          </div>

          <TabNav />

          {activeTab === 'leaderboard' && <LeaderboardTab />}  
          {activeTab === 'today' && <TodayTab />}  
          {activeTab === 'week' && <WeekTab />}  
          {activeTab === 'admin' && <AdminTab />}  
          {activeTab === 'bank' && <BankTab />}  
        </div>  
      </div>  
    </div>  
  );  
};

export default HousePointsChart;