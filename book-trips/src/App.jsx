import { Routes, Route, Link } from "react-router-dom"
import { useState } from "react"
import "./App.css"
import { useEffect } from "react";


// page components
const Home = () => {
  const [bookingss, setbookingss] = useState([]);

  useEffect(() => {
    fetch("https://managetrips.onrender.com/bookings")
      .then((res) => res.json())
      .then((data) => setbookingss(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <div className="hedding">
        <h2>Home Page</h2>
      </div>

      <div className="boxess">
        <div className="box1">
          <h5>Hi! there welcome</h5>
        </div>
        <div className="box2">
          <h5>Planning a trip?</h5>
        </div>
      </div>

      <div className="avloff">
        <div className="headss">
          <h4>Recent Bookings</h4>

          {bookingss.length === 0 ? (
            <span>No bookings available</span>
          ) : (
            bookingss.slice(0, 3).map((b) => (
              <div key={b.id} className="booking-card">
                <p><b>From:</b> {b.from_location}</p>
                <p><b>To:</b> {b.to_location}</p>
                <p><b>People:</b> {b.people_count}</p>
                <p><b>Gender:</b> {b.gender}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};


const Account = () => {
  return (<>
    <div className="hedding">
    <h2>Account Page</h2>
  </div>
  <div className="boxess">
    <div className="box1">
      <h5>Your Account Balance:</h5>
    </div>
    <div className="box2">
      <h5>Add money</h5>
    </div>
  </div>
  <div className="avloff">
    <div className="headss">
      <span>Your transactions</span>
    </div>
  </div>
  </>)
}
const Bookings = () => {

  const [gender, setGender] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [people, setPeople] = useState("");


    function SubmitBooking() {
    const bookingData = {
      from_location: from,
      to_location: to,
      people_count: people,
      gender: gender,
    };

    fetch("https://managetrips.onrender.com/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Booking successful ✅");

      setFrom("");
      setTo("");
      setPeople("");
      setGender("");
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Booking failed ❌");
      });


    }
  return (
    <>
  <div className="hedding">
    <h2>Bookings Page</h2>
  </div>
  <div className="boxess">
    <div className="box1">
      <h5>Hi! there welcome</h5>
    </div>
    <div className="box2">
      <h5>Book your trip here</h5>
    </div>
  </div>
  <div className="avloff">
      <div className="bookinginputs">
        <input type="text" placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)}/>
        <input type="text" placeholder="To" value={to} onChange={(e) => setTo(e.target.value)}/>
        <input type="number" placeholder="No of people" value={people} onChange={(e) => setPeople(e.target.value)}/>

<select
  name="gender"
  id="gender"
  value={gender}
  onChange={(e) => setGender(e.target.value)}
>
  <option value="">Select Gender</option>
  <option value="male">Male</option>
  <option value="female">Female</option>
  <option value="other">Other</option>
</select>

    <button onClick={SubmitBooking}>Book Trip</button>


      </div>
  </div>
    </>
  )
};
const QuickRide = () => {
  return (
    <>
  <div className="hedding">
    <h2>Quick Ride Page</h2>
  </div>
  <div className="boxess">
    <div className="box1">
      <h5>Hi! there welcome</h5>
    </div>
    <div className="box2">
      <h5>Planning a trip?</h5>
    </div>
  </div>
  <div className="avloff">
            <div className="bookinginputs">
        <input type="text" placeholder="From" />
        <input type="text" placeholder="To"/>
        <input type="number" placeholder="No of people"/>


    <button>Book Trip</button>


      </div>
    </div>
    </>
  )
};
const Payments = () => {
  return (
    <>
    <div className="hedding">
    <h2>Payments Page</h2>
  </div>
  <div className="boxess">
    <div className="box1">
      <h5>Hi! there welcome</h5>
    </div>
    <div className="box2">
      <h5>Add money</h5>
    </div>
  </div>
  <div className="avloff">
    <div className="headss">
      <span>Your recent Payments</span>
    </div>
  </div>
    </>
  )};


function App() {
  return (
    <div className="pagebdy">

      <div className="toolbar">
        <Link to="/"><button>Home</button></Link>
        <Link to="/account"><button>Account</button></Link>
        <Link to="/bookings"><button>Bookings</button></Link>
        <Link to="/quickride"><button>Quick Ride</button></Link>
        <Link to="/payments"><button>Payments</button></Link>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/quickride" element={<QuickRide />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </div>

    </div>
  )
}



export default App;