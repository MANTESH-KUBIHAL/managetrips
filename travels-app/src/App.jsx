import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import './App.css'
import emailjs from "@emailjs/browser";
import { useEffect } from "react";


const users = {
    driver1: {
    role: "driver",
    username: "driver1",
    password: "1111",
    name: "Domnic",
    email: "mantukubihal99@gmail.com",
    balance: 4500,
    rating: 4.6
  },
  driver2: {
    role: "driver",
    username: "driver2",
    password: "2222",
    name: "Paul",
    email: "mantukubihal99@gmail.com",
    balance: 3200,
    rating: 4.2
  },
  driver3: {
    role: "driver",
    username: "driver3",
    password: "3333",
    name: "Roman",
    email: "mantukubihal99@gmail.com",
    balance: 5100,
    rating: 4.8
  },
  manager: {
    role: "manager",
    username: "manager",
    password: "9999",
    balance: 50000,
    rating: 4.8
  }
};

const drivers = Object.values(users).filter(
  user => user.role === "driver"
);



function App() {
  const [manager, setManager] = useState(users.manager);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [drivers, setDrivers] = useState(
  Object.values(users).filter(u => u.role === "driver")
);

const [trips, setTrips] = useState([]);

useEffect(() => {
  emailjs.init("qAY2OqQOmikzQ62Dr"); // SAME PUBLIC KEY
}, []);

    useEffect(() => {
  fetch("https://managetrips.onrender.com/trips")
    .then(res => res.json())
    .then(data => setTrips(data));
}, []);



function sendTripEmail(trip) {
  const driver = drivers.find(d => d.username === trip.driver);

  if (!driver?.email) return;

  emailjs.send(
    "service_m5m8lrk",
    "template_sp424zf",
    {
      driver_name: driver.name,
      from_location: trip.from,
      to_location: trip.to,
      fare: trip.fare,
      driver_pay: trip.driverPay,
      manager_name: "Mantesh Kubihal",
      to_email: driver.email
    },
    "qAY2OqQOmikzQ62Dr"
  )
  .then(() => {
    console.log("Trip email sent");
  })
  .catch(err => {
    console.error("Email error", err);
  });
}



async function handleBookingSubmit(tripData) {
  // 1️⃣ Update driver balance
  setDrivers(prev =>
    prev.map(d =>
      d.username === tripData.driver
        ? { ...d, balance: d.balance + Number(tripData.driverPay) }
        : d
    )
  );

  // 2️⃣ Update manager balance
  setManager(prev => ({
    ...prev,
    balance: prev.balance - Number(tripData.driverPay)
  }));

  // 3️⃣ Save trip in React state
  setTrips(prev => [...prev, tripData]);

  // 4️⃣ Send email to driver
  sendTripEmail(tripData);

  // 5️⃣ Send trip to backend
  // 5️⃣ Send trip to backend
try {
  const response = await fetch("https://managetrips.onrender.com/add-trip", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    from: tripData.from,
    to: tripData.to,
    fare: tripData.fare,
    driverPay: tripData.driverPay,
    driver: tripData.driver
  })
});


  if (response.ok) {
    console.log("✅ Trip sent to backend");

    // ✅ RE-FETCH trips from backend
    const data = await fetch("https://managetrips.onrender.com/trips")
      .then(res => res.json());
    setTrips(data);  // now your state is perfectly synced with backend
  } else {
    console.error("❌ Backend error");
  }
} catch (error) {
  console.error("❌ Network error", error);
}
}





function handleLogout() {
  setCurrentUser(null);
  setUsername("");
  setPassword("");
}


function Logout({ onLogout }) {
  return (
    <div className="box1">
      <h2> Logout</h2>
      <button onClick={onLogout}>Confirm Logout</button>
    </div>
  );
}




function Home({ driver }) {
  const [myTrips, setMyTrips] = useState([]);

  useEffect(() => {
    fetch(`https://managetrips.onrender.com/trips/${driver.username}`)
      .then(res => res.json())
      .then(data => setMyTrips(data))
      .catch(err => console.error("Trip fetch error", err));
  }, [driver.username]);

  return (
    <>
      <div className="box1">
        <h2>{driver.name} Home</h2>
      </div>

      <div className="boxes">
        <div className="box2">
          <span>Account balance: ₹{driver.balance}</span>
        </div>
        <div className="box3">
          <span>Rating: {driver.rating}</span>
        </div>
      </div>

      <div className="triplist">
        <div className="assignedtrips">
          {myTrips.length === 0 ? (
            <p>No trips assigned yet</p>
          ) : (
            <ul>
              {myTrips.map(trip => (
                <li key={trip.id}>
                  {trip.from_location} → {trip.to_location} |
                  Fare: ₹{trip.fare} |
                  Earned: ₹{trip.driver_pay}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}


function Account({driver}) {
  return (
    <>

    <div className="box1">
      <h2> Driver Account</h2>
    </div>
    <div className="boxes">
      <div className="box2">
        <span>Total earnings: {driver.balance}</span>
      </div>
      <div className="box3">
        <span>Withdraw</span>
      </div>
    </div>
    </>
  )
}

function Assigned({ driver }) {
  const [myTrips, setMyTrips] = useState([]);

  useEffect(() => {
    fetch(`https://managetrips.onrender.com/trips/${driver.username}`)
      .then(res => res.json())
      .then(data => setMyTrips(data))
      .catch(err => console.error("Assigned trips fetch error", err));
  }, [driver.username]);

  return (
    <>
      <div className="box1">
        <h2>Assigned Trips</h2>
      </div>

      <div className="boxes">
        <div className="box2">
          <span>Welcome {driver.name}</span>
        </div>
        <div className="box3">
          <span>Trips Assigned</span>
        </div>
      </div>

      <div className="triplist">
        <div className="assignedtrips">
          {myTrips.length === 0 ? (
            <p>No trips assigned yet</p>
          ) : (
            <ul>
              {myTrips.map(trip => (
                <li key={trip.id}>
                  {trip.from_location} → {trip.to_location} |
                  Fare: ₹{trip.fare} |
                  Earned: ₹{trip.driver_pay}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}



function Feedback({driver}) {
  return (
    <>
    <div className="box1">
      <h2> Feedback</h2>
    </div>
    <div className="boxes">
      <div className="box2">
        <span>Performance</span>
      </div>
      <div className="box3">
        <span>
          Ratings: {driver.rating}
        </span>
      </div>
    </div>
    <div className="feedbacks">
      <h1>
        feedbacks here
      </h1>
    </div>
    </>
  );
}


function ManagerHome({ manager, drivers, trips }) {
  return (
    <>
      <div className="box1">
        <h2> Manager Home</h2>
      </div>

      <div className="boxes">
        <div className="box2">
          <h3>All Drivers</h3>
          <ul>
            {drivers.map((driver, index) => (
              <li key={index}>{driver.name}</li>
            ))}
          </ul>
        </div>

        <div className="box3">
          <p>Balance: Rs:{manager.balance}</p>
          <p>Rating: {manager.rating}</p>
        </div>
      </div>

      <div className="feedbacks">
        <h3>Total Trips:</h3>
        <ul>
  {trips.map(trip => (
  <li key={trip.id}>
    {trip.from_location} → {trip.to_location} |
    Rs:{trip.fare} |
    Driver Pay Rs:{trip.driver_pay}
  </li>
))}

</ul>

      </div>
    </>
  );
}

function ManagerAccount(){
  return(
    <>
    <div className="box1">
      <h2>Manager Account</h2>
    </div>
    <div className="boxes">
      <div className="box2">
        <span>
          Balance: {manager.balance}
        </span>
      </div>
      <div className="box3">
        <span>
          Overall Ratings: {manager.rating}
        </span>
      </div>
    </div>
    <div className="feedbacks">
      <h1>
        Previous Transactions
      </h1>
      <ul>
 {trips.map(trip => (
  <li key={trip.id}>
    {trip.from_location} → {trip.to_location} |
    Rs:{trip.fare} |
    Driver Pay Rs:{trip.driver_pay}
  </li>
))}

</ul>

    </div>
    </>
  )
}


function ManagerFeedback(){
  return(
    <>
        <div className="box1">
      <h2>Manager Feedback</h2>
    </div>
    <div className="boxes">
      <div className="box2">
        <span>
          Rating: {manager.rating}.
        </span>
      </div>
      <div className="box3">
        <span>
          Drivers ratings: 4/5.
        </span>
      </div>
    </div>
    <div className="feedbacks">
      <h1>
        Feedbacks
      </h1>
    </div>
    </>
  )
}



function Booking({drivers, onSubmitBooking }){

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fare, setFare] = useState("");
  const [driverPay, setDriverPay] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");


  function handleBooking() {
  if (!from || !to || !fare || !driverPay || !selectedDriver) {
    alert("Fill all fields");
    return;
  }

  onSubmitBooking({
    from,
    to,
    fare,
    driverPay,
    driver: selectedDriver
  });

  setFrom("");
  setTo("");
  setFare("");
  setDriverPay("");
  setSelectedDriver("");
}
  return(
    <>
        <div className="box1">
      <h2>Bookings</h2>
    </div>
    <div className="boxes">
      <div className="box2">
        <span>
          Available drivers:
           <ul>
            {drivers.map((driver, index) => (
              <li key={index}>{driver.name}</li>
            ))}
          </ul>
        </span>
      </div>
      <div className="box3">
        <span>
          Total Balance: {manager.balance}
        </span>
      </div>
    </div>
    <div className="feedbacks">
      
      <input placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
<input placeholder="To" value={to} onChange={e => setTo(e.target.value)} />

<input
  type="number"
  placeholder="Total Fare"
  value={fare}
  onChange={e => setFare(e.target.value)}
/>

<input
  type="number"
  placeholder="Driver Pay"
  value={driverPay}
  onChange={e => setDriverPay(e.target.value)}
/>

<select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
  <option value="">Select Driver</option>
  {drivers.map(d => (
    <option key={d.username} value={d.username}>
      {d.name}
    </option>
  ))}
</select>

<button onClick={handleBooking}>Assign Trip</button>
    </div>

    
    </>
  )
}


function onSubmit() {
  const u = username.trim().toLowerCase();
  const p = password.trim();

  const user = Object.values(users).find(
    (item) => item.username === u && item.password === p
  );

if (!u || !p) {
  alert("Please fill the essential details");
} else if (user) {
  if (user.role === "driver") {
    const liveDriver = drivers.find(
      d => d.username === user.username
    );
    setCurrentUser(liveDriver);
  } else {
    setCurrentUser(manager);
  }
} else {
  alert("Wrong username or password");
}
}


function DriverPage({ driver,trips, onLogout }) {
  return (
    <>
      <div className="taskbar">
        <div className="values">
          <Link to="/home"><button>Home</button></Link>
          <Link to="/account"><button>Account</button></Link>
          <Link to="/assigned"><button>Assigned</button></Link>
          <Link to="/feedback"><button>Feedback</button></Link>
          <Link to="/logout"><button>Logout</button></Link>

        </div>
      </div>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home driver={driver} trips={trips} />} />
          <Route path="/account" element={<Account driver={driver} trips={trips}/>} />
          <Route path="/assigned" element={<Assigned driver={driver} trips={trips} />} />
          <Route path="/feedback" element={<Feedback driver={driver} />} />
          <Route path="/logout" element={<Logout onLogout={onLogout} />} />
        </Routes>
    </>
  );
}


function ManagerPage({manager, drivers, trips}) {
  return (
    <>
      <div className="taskbar">
        <div className="values">
          <Link to="/managerhome"><button>Home</button></Link>
          <Link to="/manageraccount"><button>Account</button></Link>
          <Link to="/managerfeedback"><button>Feedback</button></Link>
          <Link to="/booking"><button>Bookings</button></Link>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <Routes>

  <Route
    path="/"
    element={
      <Navigate to="/managerhome" 
      replace
      />
    }
  />


  <Route
    path="/managerhome"
    element={
      <ManagerHome
        manager={manager}
        drivers={drivers}
        trips={trips}
      />
    }
  />

  <Route
    path="/manageraccount"
    element={<ManagerAccount manager={manager} />}
  />

  <Route
    path="/managerfeedback"
    element={<ManagerFeedback manager={manager} />}
  />

  <Route
    path="/booking"
    element={
      <Booking
        drivers={drivers}
        onSubmitBooking={handleBookingSubmit}
      />
    }
  />
</Routes>

    </>
  )
}

return (
  <BrowserRouter basename='/managetrips'>

{currentUser?.role === "driver" && (
  <DriverPage
    driver={currentUser}
    trips={trips}
    onLogout={handleLogout}
  />
)}

    {currentUser?.role === "manager" && (
  <ManagerPage
    manager={manager}
    drivers={drivers}
    trips={trips}
  />
)}

    {!currentUser && (
      <div className="loginpage">
        <h1>Trip Managment</h1>
        <div className="loginbox">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={onSubmit}>Submit</button>
        </div>
      </div>
    )}

  </BrowserRouter>
);
}

export default App
