import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import time
import random
import threading
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

TEAMS = {
    "CSK": {"name": "Chennai Super Kings", "color": "#F9CD05", "logo": "https://ui-avatars.com/api/?name=CSK&background=F9CD05&color=fff&size=128"},
    "MI": {"name": "Mumbai Indians", "color": "#004BA0", "logo": "https://ui-avatars.com/api/?name=MI&background=004BA0&color=fff&size=128"},
    "RCB": {"name": "Royal Challengers Bengaluru", "color": "#EA1A2A", "logo": "https://ui-avatars.com/api/?name=RCB&background=EA1A2A&color=fff&size=128"},
    "KKR": {"name": "Kolkata Knight Riders", "color": "#3A225D", "logo": "https://ui-avatars.com/api/?name=KKR&background=3A225D&color=fff&size=128"},
    "DC": {"name": "Delhi Capitals", "color": "#00008B", "logo": "https://ui-avatars.com/api/?name=DC&background=00008B&color=fff&size=128"},
    "RR": {"name": "Rajasthan Royals", "color": "#EA1A85", "logo": "https://ui-avatars.com/api/?name=RR&background=EA1A85&color=fff&size=128"},
    "PBKS": {"name": "Punjab Kings", "color": "#DD1F2D", "logo": "https://ui-avatars.com/api/?name=PBKS&background=DD1F2D&color=fff&size=128"},
    "SRH": {"name": "Sunrisers Hyderabad", "color": "#F26522", "logo": "https://ui-avatars.com/api/?name=SRH&background=F26522&color=fff&size=128"},
    "LSG": {"name": "Lucknow Super Giants", "color": "#00AEEF", "logo": "https://ui-avatars.com/api/?name=LSG&background=00AEEF&color=fff&size=128"},
    "GT": {"name": "Gujarat Titans", "color": "#1B2133", "logo": "https://ui-avatars.com/api/?name=GT&background=1B2133&color=fff&size=128"}
}

SQUADS = {
    "CSK": ["R Gaikwad", "R Ravindra", "D Mitchell", "S Dube", "MS Dhoni", "R Jadeja", "M Ali", "D Chahar", "S Thakur", "M Pathirana", "M Theekshana"],
    "MI": ["R Sharma", "I Kishan", "S Yadav", "T Varma", "H Pandya", "T David", "R Shepherd", "P Chawla", "J Bumrah", "N Thushara", "G Coetzee"],
    "RCB": ["V Kohli", "F du Plessis", "R Patidar", "G Maxwell", "W Jacks", "D Karthik", "M Lomror", "M Siraj", "L Ferguson", "Y Dayal", "R Topley"],
    "DC": ["D Warner", "P Shaw", "M Marsh", "R Pant", "T Stubbs", "A Patel", "K Yadav", "M Kumar", "A Nortje", "I Sharma", "K Ahmed"],
    "KKR": ["P Salt", "S Narine", "V Iyer", "S Iyer", "R Singh", "A Russell", "R Ramandeep", "M Starc", "V Chakravarthy", "H Rana", "S Sharma"],
    "RR": ["Y Jaiswal", "J Buttler", "S Samson", "R Parag", "D Jurel", "S Hetmyer", "R Powell", "R Ashwin", "T Boult", "A Khan", "Y Chahal"],
    "SRH": ["T Head", "A Sharma", "A Markram", "N Reddy", "H Klaasen", "A Samad", "P Cummins", "B Kumar", "T Natarajan", "J Unadkat", "M Markande"],
    "LSG": ["Q de Kock", "KL Rahul", "D Padikkal", "M Stoinis", "N Pooran", "A Badoni", "K Pandya", "R Bishnoi", "Y Thakur", "M Khan", "N-ul-Haq"],
    "GT": ["S Gill", "W Saha", "S Sudharsan", "K Williamson", "D Miller", "R Tewatia", "R Khan", "U Yadav", "M Sharma", "S Johnson", "N Ahmad"],
    "PBKS": ["S Dhawan", "J Bairstow", "P Singh", "S Curran", "L Livingstone", "J Sharma", "S Singh", "H Patel", "K Rabada", "A Singh", "R Chahar"]
}

def get_player(team, idx):
    sq = SQUADS.get(team, [])
    if idx < len(sq):
        return sq[idx]
    return f"Player {idx+1}"

NAME_TO_CODE = {v["name"]: k for k, v in TEAMS.items()}

RAW_SCHEDULE = """Match 14
Arun Jaitley Stadium, Delhi
APR, WED 8
7:30 pm IST
Delhi Capitals
Gujarat Titans
Match Centre
Match 15
Eden Gardens, Kolkata
APR, THU 9
7:30 pm IST
Kolkata Knight Riders
Lucknow Super Giants
Match Centre
Match 16
ACA Stadium, Guwahati
APR, FRI 10
7:30 pm IST
Rajasthan Royals
Royal Challengers Bengaluru
Match Centre
Match 17
New International Cricket Stadium, New Chandigarh
APR, SAT 11
3:30 pm IST
Punjab Kings
Sunrisers Hyderabad
Match Centre
Match 18
MA Chidambaram Stadium, Chennai
APR, SAT 11
7:30 pm IST
Chennai Super Kings
Delhi Capitals
Match Centre
Match 19
Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow
APR, SUN 12
3:30 pm IST
Lucknow Super Giants
Gujarat Titans
Match Centre
Match 20
Wankhede Stadium, Mumbai
APR, SUN 12
7:30 pm IST
Mumbai Indians
Royal Challengers Bengaluru
Match Centre
Match 21
Rajiv Gandhi International Stadium, Hyderabad
APR, MON 13
7:30 pm IST
Sunrisers Hyderabad
Rajasthan Royals
Match Centre
Match 22
MA Chidambaram Stadium, Chennai
APR, TUE 14
7:30 pm IST
Chennai Super Kings
Kolkata Knight Riders
Match Centre
Match 23
M Chinnaswamy Stadium, Bengaluru
APR, WED 15
7:30 pm IST
Royal Challengers Bengaluru
Lucknow Super Giants
Match Centre
Match 24
Wankhede Stadium, Mumbai
APR, THU 16
7:30 pm IST
Mumbai Indians
Punjab Kings
Match Centre
Match 25
Narendra Modi Stadium, Ahmedabad
APR, FRI 17
7:30 pm IST
Gujarat Titans
Kolkata Knight Riders
Match Centre
Match 26
M Chinnaswamy Stadium, Bengaluru
APR, SAT 18
3:30 pm IST
Royal Challengers Bengaluru
Delhi Capitals
Match Centre
Match 27
Rajiv Gandhi International Stadium, Hyderabad
APR, SAT 18
7:30 pm IST
Sunrisers Hyderabad
Chennai Super Kings
Match Centre
Match 28
Eden Gardens, Kolkata
APR, SUN 19
3:30 pm IST
Kolkata Knight Riders
Rajasthan Royals
Match Centre
Match 29
New International Cricket Stadium, New Chandigarh
APR, SUN 19
7:30 pm IST
Punjab Kings
Lucknow Super Giants
Match Centre
Match 30
Narendra Modi Stadium, Ahmedabad
APR, MON 20
7:30 pm IST
Gujarat Titans
Mumbai Indians
Match Centre
Match 31
Rajiv Gandhi International Stadium, Hyderabad
APR, TUE 21
7:30 pm IST
Sunrisers Hyderabad
Delhi Capitals
Match Centre
Match 32
Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow
APR, WED 22
7:30 pm IST
Lucknow Super Giants
Rajasthan Royals"""

matches = []

def parse_schedule():
    lines = [L.strip() for L in RAW_SCHEDULE.split("\n") if L.strip() and L.strip() != "Match Centre"]
    
    random.seed(42)
    
    for i in range(0, len(lines), 6):
        if i + 5 >= len(lines):
            break
            
        m_id_str = lines[i]
        m_venue = lines[i+1]
        m_date_raw = lines[i+2]
        m_time_raw = lines[i+3]
        m_team1 = lines[i+4]
        m_team2 = lines[i+5]
        
        day_num = m_date_raw.split(" ")[-1]
        m_date = f"2026-04-{int(day_num):02d}"
        
        t1 = NAME_TO_CODE.get(m_team1, "CSK")
        t2 = NAME_TO_CODE.get(m_team2, "MI")
        m_id = m_id_str.replace(" ", "_").lower()
        
        ftime = "07:30 PM IST" if "7:30" in m_time_raw else "03:30 PM IST"
        
        # Parse official string time (e.g. "07:30 PM IST") to actual python datetime
        # Strip " IST" and parse
        time_format = "%I:%M %p"
        clean_time_str = ftime.replace(" IST", "")
        dt_time = datetime.strptime(clean_time_str, time_format).time()
        
        m_datetime = datetime(int(m_date[0:4]), int(m_date[5:7]), int(m_date[8:10]), dt_time.hour, dt_time.minute)
        now = datetime.now()
        
        status = "upcoming"
        if now > m_datetime + timedelta(hours=4):
            status = "completed"
        elif now >= m_datetime:
            status = "live"
            
        m = {
            "id": m_id,
            "date": m_date,
            "time": ftime,
            "datetime": m_datetime.isoformat(),
            "team1": t1,
            "team2": t2,
            "venue": m_venue,
            "toss": f"{t1} won the toss and elected to bat",
            "status": status,
            "state": None,
            "predictions": {}
        }

        if status == "completed":
            m["state"] = {
                 "batting_team": t1,
                 "score": random.randint(160, 220),
                 "wickets": random.randint(4, 9)
            }
            m["toss"] = f"{t1} won by {random.randint(10,30)} runs"
        elif status == "live":
            p1 = get_player(t1, 0)
            p2 = get_player(t1, 1)
            b1_runs = random.randint(5, 30)
            b2_runs = random.randint(5, 30)
            m["state"] = {
                "innings": 1,
                "target": None,
                "batting_team": t1,
                "bowling_team": t2,
                "score": b1_runs + b2_runs + random.randint(0, 5), # add some extras
                "wickets": 0,
                "overs": float(random.randint(2, 5)),
                "recent_balls": ["1", "0", "4", "2", "1", "1"],
                "batter_1": {"name": p1, "runs": b1_runs, "balls": int(b1_runs*0.8), "fours": b1_runs//6, "sixes": b1_runs//10},
                "batter_2": {"name": p2, "runs": b2_runs, "balls": int(b2_runs*0.8), "fours": b2_runs//6, "sixes": b2_runs//10},
                "on_strike": 1
            }
            m["predictions"] = {
                "predicted_score": random.randint(180, 220),
                "win_probability_team1": random.randint(45, 55),
                "win_probability_team2": random.randint(45, 55),
                "predicted_winner": t1
            }
        else: # upcoming
            pt1 = random.randint(160, 210)
            pt2 = random.randint(160, 210)
            pw = t1 if pt1 > pt2 else t2
            m["predictions"] = {
                "predicted_score_team1": pt1,
                "predicted_score_team2": pt2,
                "win_probability_team1": random.randint(40, 60),
                "win_probability_team2": random.randint(40, 60),
                "predicted_winner": pw
            }
            
        matches.append(m)

parse_schedule()

def format_overs(balls_total):
    return f"{balls_total // 6}.{balls_total % 6}"

def simulate_match():
    # Keep running to update all live matches independently 
    while True:
        time.sleep(3) 
        updated_any = False
        now = datetime.now()
        
        for match in matches:
            # Re-evaluate status based on system clock
            m_dt = datetime.fromisoformat(match["datetime"])
            
            new_status = "upcoming"
            if now > m_dt + timedelta(hours=4):
                new_status = "completed"
            elif now >= m_dt:
                new_status = "live"
                
            if match["status"] != new_status:
                match["status"] = new_status
                updated_any = True
                # Intialize empty state if switching to live
                if new_status == "live" and not match["state"]:
                    t1 = match["team1"]
                    t2 = match["team2"]
                    p1 = get_player(t1, 0)
                    p2 = get_player(t1, 1)
                    match["state"] = {
                        "innings": 1,
                        "target": None,
                        "batting_team": t1,
                        "bowling_team": t2,
                        "score": 0,
                        "wickets": 0,
                        "overs": 0.0,
                        "recent_balls": [],
                        "batter_1": {"name": p1, "runs": 0, "balls": 0, "fours": 0, "sixes": 0},
                        "batter_2": {"name": p2, "runs": 0, "balls": 0, "fours": 0, "sixes": 0},
                        "on_strike": 1
                    }
                    match["toss"] = f"{t1} won the toss and elected to bat"
                if new_status == "completed" and match["state"]:
                    match["toss"] = "Match Completed"

            # If not live or no state, do nothing
            if match["status"] != "live" or not match["state"]:
                continue
                
            st = match["state"]
            ov = st["overs"]
            total_balls = int(ov) * 6 + int(round((ov - int(ov)) * 10))
            
            runs_possible = [0, 1, 2, 3, 4, 6]
            probabilities = [0.4, 0.3, 0.05, 0.01, 0.14, 0.1]
            
            # Wicket logic
            is_wicket = random.random() < 0.05
            
            striker_key = "batter_1" if st["on_strike"] == 1 else "batter_2"
            
            if is_wicket and st["wickets"] < 10:
                st["wickets"] += 1
                st["recent_balls"].append("W")
                # New batsman comes in
                new_idx = st["wickets"] + 1
                new_player = get_player(st["batting_team"], new_idx)
                st[striker_key] = {"name": new_player, "runs": 0, "balls": 0, "fours": 0, "sixes": 0}
            else:
                runs = random.choices(runs_possible, probabilities)[0]
                st["score"] += runs
                st["recent_balls"].append(str(runs))
                
                # Update batsman stats
                st[striker_key]["runs"] += runs
                st[striker_key]["balls"] += 1
                if runs == 4:
                    st[striker_key]["fours"] += 1
                elif runs == 6:
                    st[striker_key]["sixes"] += 1
                    
                # Change strike on odd runs
                if runs in [1, 3]:
                    st["on_strike"] = 2 if st["on_strike"] == 1 else 1
            
            if len(st["recent_balls"]) > 6:
                st["recent_balls"] = st["recent_balls"][-6:]
                
            total_balls += 1
            st["overs"] = float(format_overs(total_balls))
            
            # Change strike at end of over
            if total_balls % 6 == 0:
                st["on_strike"] = 2 if st["on_strike"] == 1 else 1
            
            # Realistic Predictions Logic
            if st["innings"] == 1:
                run_rate = st["score"] / (total_balls / 6) if total_balls > 0 else 0
                remaining_overs = 20.0 - (total_balls / 6.0)
                
                # Dampen projected score using wickets
                wicket_penalty = st["wickets"] * 2.5
                expected_rr = max(5.0, run_rate - (wicket_penalty * 0.1))
                base_pred = st["score"] + (remaining_overs * expected_rr)
                
                match["predictions"]["predicted_score"] = int(base_pred + random.randint(-4, 4))
                
                # Shift win probability dynamically based on scoring rate vs expected 170
                diff = match["predictions"]["predicted_score"] - 170
                w_prob = 50 + (diff * 0.5) 
                # Bound it cleanly
                w_prob = max(5, min(95, int(w_prob)))
                
                match["predictions"]["win_probability_team1"] = w_prob
                match["predictions"]["win_probability_team2"] = 100 - w_prob
            else:
                # 2nd innings predictions
                target = st["target"]
                required = target - st["score"]
                rem_balls = 120 - total_balls
                
                if rem_balls > 0:
                    req_rr = (required / rem_balls) * 6
                    curr_rr = st["score"] / (total_balls / 6) if total_balls>0 else 0
                    if req_rr > curr_rr + 2:
                        w_prob2 = max(5, int(50 - (req_rr - curr_rr)*4))
                    else:
                        w_prob2 = min(95, int(50 + (curr_rr - req_rr)*4))
                else:
                    w_prob2 = 100 if required <= 0 else 0
                    
                match["predictions"]["win_probability_" + ("team2" if st["batting_team"]==match["team2"] else "team1")] = w_prob2
                match["predictions"]["win_probability_" + ("team1" if st["batting_team"]==match["team2"] else "team2")] = 100 - w_prob2

            if match["predictions"]["win_probability_team1"] > 50:
                 match["predictions"]["predicted_winner"] = match["team1"]
            else:
                 match["predictions"]["predicted_winner"] = match["team2"]
            
            # Cap at 20 overs (120 balls max)
            if total_balls >= 120 or st["wickets"] == 10 or (st["target"] and st["score"] >= st["target"]):
                if st["innings"] == 1:
                    st["innings"] = 2
                    st["target"] = st["score"] + 1
                    
                    st["batting_team"] = match["team2"] if st["batting_team"] == match["team1"] else match["team1"]
                    st["bowling_team"] = match["team1"] if st["batting_team"] == match["team2"] else match["team2"]
                    
                    st["score"] = 0
                    st["wickets"] = 0
                    st["overs"] = 0.0
                    total_balls = 0
                    st["recent_balls"] = []
                    
                    p1 = get_player(st["batting_team"], 0)
                    p2 = get_player(st["batting_team"], 1)
                    st["batter_1"] = {"name": p1, "runs": 0, "balls": 0, "fours": 0, "sixes": 0}
                    st["batter_2"] = {"name": p2, "runs": 0, "balls": 0, "fours": 0, "sixes": 0}
                    st["on_strike"] = 1
                    match["predictions"]["predicted_score"] = 0 
                else:
                    match["status"] = "completed"
                    winner = st["batting_team"] if st["score"] >= st["target"] else st["bowling_team"]
                    margin = f"by {10 - st['wickets']} wickets" if winner == st["batting_team"] else f"by {st['target'] - 1 - st['score']} runs"
                    match["toss"] = f"{winner} won {margin}"

        if updated_any:
            current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            socketio.emit('match_update', {
                'matches': matches,
                'teams': TEAMS,
                'timestamp': current_time_str
            })

@app.route('/api/init')
def get_init_data():
    return {
        "teams": TEAMS,
        "matches": matches,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

if __name__ == '__main__':
    simulator_thread = threading.Thread(target=simulate_match)
    simulator_thread.daemon = True
    simulator_thread.start()
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, use_reloader=False)
