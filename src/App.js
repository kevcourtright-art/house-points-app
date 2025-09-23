import React, { useState, useEffect } from 'react';
import { Check, X, Plus, Trash2, Calendar, Users, Star, Award, Zap } from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

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

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Firebase real-time listeners
  useEffect(() => {
    // Listen to tasks changes
    const unsubscribeTasks = onSnapshot(doc(db, 'housePoints', 'tasks'), (doc) => {
      if (doc.exists() && doc.data().tasks) {
        setTasks(doc.data().tasks);
      }
      setLoading(false);
    });

    // Listen to completed tasks changes
    const unsubscribeCompleted = onSnapshot(doc(db, 'housePoints', 'completedTasks'), (doc) => {
      if (doc.exists() && doc.data().completed) {
        setCompletedTasks(doc.data().completed);
      }
    });

    // Listen to manual points changes
    const unsubscribeManual = onSnapshot(doc(db, 'housePoints', 'manualPoints'), (doc) => {
      if (doc.exists() && doc.data().points) {
        setManualPoints(doc.data().points);
      }
    });

    return () => {
      unsubscribeTasks();
      unsubscribeCompleted();
      unsubscribeManual();
    };
  }, []);

  // Save tasks to Firebase
  const saveTasksToFirebase = async (newTasks) => {
    try {
      await setDoc(doc(db, 'housePoints', 'tasks'), { tasks: newTasks });
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Save completed tasks to Firebase
  const saveCompletedToFirebase = async (completed) => {
    try {
      await setDoc(doc(db, 'housePoints', 'completedTasks'), { completed });
    } catch (error) {
      console.error('Error saving completed tasks:', error);
    }
  };

  // Save manual points to Firebase
  const saveManualPointsToFirebase = async (points) => {
    try {
      await setDoc(doc(db, 'housePoints', 'manualPoints'), { points });
    } catch (error) {
      console.error('Error saving manual points:', error);
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

  const calculateHousePoints = (house) => {
    let total = 0;
    
    // Points from completed tasks
    Object.keys(completedTasks).forEach(key => {
      if (key.startsWith(house) && completedTasks[key]) {
        const taskId = parseInt(key.split('-')[2]);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          total += task.points;
        }
      }
    });
    
    // Add manual points
    if (manualPoints[house]) {
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
      // Clear completed tasks for this house
      const newCompleted = {};
      Object.keys(completedTasks).forEach(key => {
        if (!key.startsWith(house)) {
          newCompleted[key] = completedTasks[key];
        }
      });
      setCompletedTasks(newCompleted);
      saveCompletedToFirebase(newCompleted);
      
      // Clear manual points for this house
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

  const HouseEmblem = ({ house, size = 62 }) => {
    // Your actual GitHub raw URLs with correct case
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
        overflow: 'hidden'
      }}>
        <img 
          src={imageUrls[house]}
          alt={`${house} emblem`}
          style={{
            width: `${size - 8}px`,
            height: `${size - 8}px`,
            objectFit: 'cover',
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
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              background: 'linear-gradient(to right, #92400e, #f59e0b, #92400e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              House Points Championship
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: '#fde68a',
              color: '#92400e',
              padding: '12px 24px',
              borderRadius: '50px',
              fontWeight: 'bold'
            }}>
              <Star size={24} />
              <span>Magical House Competition - Live Updates!</span>
              <Award size={24} />
            </div>
          </div>

          {/* House Points Leaderboard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {sortedHouses.map((house, index) => {
              const colors = houseColors[house.name];
              const isWinning = index === 0;
              return (
                <div key={house.name} style={{
                  background: colors.gradient,
                  borderRadius: '16px',
                  padding: '24px',
                  color: 'white',
                  boxShadow: isWinning ? '0 12px 24px rgba(251, 191, 36, 0.4)' : '0 8px 16px rgba(0,0,0,0.2)',
                  transform: isWinning ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: isWinning ? '4px solid #fbbf24' : 'none',
                  position: 'relative'
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
                      <HouseEmblem house={house.name} size={225} />
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

          {/* Weekly House Activity Calendar */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
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
                {/* Calendar Header */}
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

                {/* Calendar Body */}
                {houses.map((house) => {
                  const colors = houseColors[house];
                  return (
                    <div key={house} style={{
                      display: 'grid',
                      gridTemplateColumns: '150px repeat(7, 1fr)',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      {/* House emblem only */}
                      <div style={{
                        padding: '16px',
                        background: colors.gradient,
                        borderRadius: '12px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <HouseEmblem house={house} size={125} />
                      </div>

                      {/* Daily task slots */}
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
                            {/* Task selection dropdown */}
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

                            {/* Completed tasks list */}
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

                            {/* Empty state */}
                            {dayCompletedTasks.length === 0 && (
                              <div style={{
                                textAlign: 'center',
                                color: '#f59e0b',
                                fontSize: '0.75rem',
                                marginTop: '16px'
                              }}>
                                No deeds completed
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Management */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
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
            
            {/* Add New Task */}
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

            {/* Manual Points Management */}
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

            {/* Current Tasks List */}
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
      </div>
    </div>
  );
};

export default HousePointsChart;