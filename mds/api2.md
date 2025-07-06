FBR API
Table of Contents
Introduction - Important Note: Scraping Restriction - About FBR API - Base URL - Authentication
Usage - Supported Endpoints
All Endpoints - Countries - Leagues - League Seasons - League Season Details - League Standings - Teams - Players - Team Season Stats - Team Match Stats - Player Season Stats - Player Match Stats - All Player Match Stats - Authentication
Error Handling
Introduction
Welcome to the FBR API documentation!

The FBR API is designed to provide developers, statistics enthusiasts, and football (soccer) fans with convenient access to data from fbref.com. As a premier source of football statistics, fbref.com offers comprehensive information on leagues, teams, and players from around the world.

This documentation can be found simply by going to: http://fbrapi.com/documentation.

Important Note: Scraping Restriction
Before using the FBR API, please be aware that fbref.com imposes a scraping restriction that allows users to make only one request every 6 seconds. This limitation is in place to ensure fair usage of their resources and maintain the stability of their website.

It is crucial to adhere to this scraping restriction to avoid being blocked by fbref.com. Failure to comply with this restriction may result in temporary or permanent IP bans.

About FBR API
The FBR API offers a RESTful interface for accessing a wide range of football-related data, including:

Player statistics
Team statistics
League standings
Match results
And much more!
Base URL
The base URL for the API is:

https://fbrapi.com

Authentication
Access to the FBR API endpoints requires authentication using an API key. To request an API key, send a POST request to the /generate_api_key endpoint. This endpoint will generate a unique API key for you to use when making requests to the FBR API.

Example Using cURL
curl -X POST https://fbrapi.com/generate_api_key
Example Using python requests:
import requests

response = requests.post('https://fbrapi.com/generate_api_key')
api_key = response.json()['api_key']
print("API Key:", api_key)
Example use nodeJS
const fetch = require('node-fetch');

(async () => {
  try {
    const response = await fetch('https://fbrapi.com/generate_api_key', {
      method: 'POST'
    });
    const data = await response.json();
    const apiKey = data.api_key;
    console.log('API Key:', apiKey);
  } catch (error) {
    console.error('Error:', error);
  }
})();
Example using JS
fetch('https://fbrapi.com/generate_api_key', {
  method: 'POST'
})
.then(response => response.json())
.then(data => console.log("API Key:", data.api_key));
Example Using R rvest package
library(rvest)

# API Key Post Method
generate_api_key <- function() {
  # Perform POST request to generate API key
  response <- POST(
    url = "https://fbrapi.com/generate_api_key",
    encode = "json"
  )
  
  # Extract API key from response
  api_key <- content(response, "parsed")$api_key
  
  return(api_key)
}

# Generate API key
api_key <- generate_api_key()
print(api_key)
Rate Limiting
To ensure fair usage of the FBR API and to comply with scraping restrictions imposed by fbref.com, users are limited to one request every 3 seconds. Please make sure to adhere to this rate limit to avoid being blocked.

Usage
Direct HTTP Requests: Make HTTP requests to the API endpoints using your preferred programming language or tool.
Command-line Tools: Utilize command-line tools such as cURL or HTTPie to interact with the API.
API Clients: Use pre-built API client libraries available for popular programming languages.
Web Applications: Integrate the FBR API into your web applications to fetch football statistics dynamically.
Below shows an example of how to retrieve data through FBR API’s player-match-stats endpoint. This example will return a json object containing match-by-match statsitics for Son Heung-min (player_id = 92e7e919) in the premier league (league_id = 9) during the (season_id = 2023-2024) season.

Note: Make sure to replace ‘YOUR_API_KEY’ with your actual api key.

Example Using cURL
curl -X GET "https://fbrapi.com/player-match-stats?player_id=92e7e919&league_id=9&season_id=2023-2024" \
-H "X-API-Key: YOUR_API_KEY"
Example Using python requests:
import requests

url = "https://fbrapi.com/player-match-stats"
params = {
    "player_id": "92e7e919",
    "league_id": "9",
    "season_id": "2023-2024"
}
headers = {"X-API-Key": "YOUR_API_KEY"}

response = requests.get(url, params=params, headers=headers)
print(response.json())
Example use nodeJS
const axios = require('axios');

axios.get("https://fbrapi.com/player-match-stats", {
  params: {
    player_id: "92e7e919",
    league_id: "9",
    season_id: "2023-2024"
  },
  headers: {
    "X-API-Key": "YOUR_API_KEY"
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
Example using JS
fetch("https://fbrapi.com/player-match-stats?player_id=92e7e919&league_id=9&season_id=2023-2024", {
  method: "GET",
  headers: {
    "X-API-Key": "YOUR_API_KEY"
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
Example Using R rvest package
library(rvest)
url <- "https://fbrapi.com/player-match-stats"
params <- list(
  player_id = "92e7e919",
  league_id = "9",
  season_id = "2023-2024"
)
headers <- list("X-API-Key" = api_key)

# Perform GET request for player match stats
response <- GET(url, query = params, add_headers(headers))

# Extract and print response content
content <- content(response, "parsed")
print(content)
Supported Endpoints
The FBR API supports the following endpoints:

/documentation: GET method to view FBR API documentation.
/generate_api_key: POST method to generate a new API key.
/countries: GET method to retrieve football-related meta-data for all available countries
/leagues: GET method to retrieve meta-data for all unique leagues associated with a specified country.
/league-seasons: GET method to retrieve all season ids for a specific league id
/league-season-details: GET method to retrieve meta-data for a specific league id and season id.
/league-standings: GET method to retrieve all standings tables for a given league and season id.
/teams: GET method to retrieve team roster and schedule data
/players: GET method to retrieve player meta-data
/matches: GET method to retrieve to retrieve match meta-data.
/team-season-stats: GET method to retrieve season-level team statistical data for a specified league and season.
/team-match-stats: GET method to retrieve match-level team statistical data for a specified team, league and season.
/player-season-stats: GET method to retrieve aggregate season stats for all players for a team-league-season
/player-match-stats: GET method to retrieve matchlog data for a given player-league-season
/all-players-match-stats: GET method to retrieve match stats for all players in a match
All Endpoints
Countries
Endpoint to retrieve meta-data for all available countries that have either domestic or international football teams tracked by football reference.If no parameters are passed, data for all countries is returned.If a country code is passed then data for only that specific country is returned.

country_code retrieved by this endpoint can be used to retrieve data in the leagues endpoint
Parameters:

country (str, optional): Name of the country for which to retrieve
Response:

{
    "data": [
        {
            "country": "Afghanistan",
            "country_code": "AFG",
            "governing_body": "AFC",
            "#_clubs": 0,
            "#_players": 194,
            "national_teams": [
                "M",
                "F"
            ]
        },
        {
            "country": "Albania",
            "country_code": "ALB",
            "governing_body": "UEFA",
            "#_clubs": 17,
            "#_players": 543,
            "national_teams": [
                "M",
                "F"
            ]
        },
}
Notes

Meta-data, when available, includes:

country (str): Name of the country.
country_code (str): Three-letter country abbreviation, used by FbrefLeaguesScraper to identify league information related to the country.
governing_body (str): Abbreviation of the country’s governing body, typically based on geographical location.
num_clubs (int): Number of club teams in the country that are covered by Football Reference.
num_players (int): Number of players from the country that are covered by Football Reference.
national_teams (list of str): National teams from the country that are covered by Football Reference.
Leagues
Endpoint to retrieve meta-data for all unique leagues associated with a specified country. Data is retrieved based on a country’s three-letter country code used as identification within football reference.

Parameters:

country_code (str): Three-letter code used by football reference to identify specific country
Response:

{
    "data": [
        {
            "league_type": "domestic_leagues",
            "leagues": [
                {
                    "league_id": 25,
                    "competition_name": "J1 League",
                    "gender": "M",
                    "first_season": "2014",
                    "last_season": "2024",
                    "tier": "1st"
                },
                {
                    "league_id": 893,
                    "competition_name": "Women Empowerment League",
                    "gender": "F",
                    "first_season": "2021-2022",
                    "last_season": "2023-2024",
                    "tier": "1st"
                },
                {
                    "league_id": 49,
                    "competition_name": "J2 League",
                    "gender": "M",
                    "first_season": "2014",
                    "last_season": "2024",
                    "tier": "2nd"
                }
            ]
        },
        {
            "league_type": "international_competitions",
            "leagues": [
                {
                    "league_id": 250,
                    "competition_name": "AFC Champions League",
                    "gender": "M"
                }
            ]
        },
        {
            "league_type": "national_team_competitions",
            "leagues": [
                {
                    "league_id": 7,
                    "competition_name": "WCQ AFC M",
                    "gender": "M"
                },
                {
                    "league_id": 664,
                    "competition_name": "Asian Cup",
                    "gender": "M"
                },
                {
                    "league_id": 1,
                    "competition_name": "World Cup",
                    "gender": "M"
                },
                {
                    "league_id": 685,
                    "competition_name": "Copa America",
                    "gender": "M"
                },
                {
                    "league_id": 212,
                    "competition_name": "SheBelieves Cup",
                    "gender": "F"
                },
                {
                    "league_id": 180,
                    "competition_name": "Olympics W",
                    "gender": "F"
                },
                {
                    "league_id": 106,
                    "competition_name": "Womens World Cup",
                    "gender": "F"
                },
                {
                    "league_id": 161,
                    "competition_name": "AFC Womens Asian Cup",
                    "gender": "F"
                }
            ]
        }
    ]
}
Notes

Leagues are classified as one of the following:

domestic_leagues - Club-level league competitions occurring only within the specified country.
domestic_cups - Club-level cup competitions occurring only within the specified country.
international_competitions - Club-level competitions occurring between teams in the specified country and teams from other countries.
national_team_competitions - National team-level competitions where the specified country’s national team participated.
Meta-data, when available, includes:

league_id (int): Football reference league ID number.
competition_name (str): Name of the league.
gender (str): ‘M’ for male or ‘F’ for female.
first_season (str): Season ID for the earliest season that the league is tracked in Football Reference.
last_season (str): Season ID for the latest season that the league is tracked in Football Reference.
tier (str): Determines the level on the country’s football pyramid to which the competition belongs.
League Seasons
Endpoint to retrieve meta data for all season ids tracked by football reference, given a football reference league id.

season_id retrieved by this endpoint can be used to retrieve data in the league-seasons, league-season-details, league-standings and endpoint
Parameters:

league_id (int): Integer representing a league’s football reference id
Response:

{
    "data": [
        {
            "season_id": "2023-2024",
            "competition_name": "Premier League",
            "#_squads": 20,
            "champion": "Manchester City",
            "top_scorer": {
                "player": "Erling Haaland",
                "goals_scored": 27
            }
        },
        {
            "season_id": "2022-2023",
            "competition_name": "Premier League",
            "#_squads": 20,
            "champion": "Manchester City",
            "top_scorer": {
                "player": "Erling Haaland",
                "goals_scored": 36
            }
        },
        {
            "season_id": "2021-2022",
            "competition_name": "Premier League",
            "#_squads": 20,
            "champion": "Manchester City",
            "top_scorer": {
                "player": [
                    "Son Heung min",
                    "Mohamed Salah"
                ],
                "goals_scored": 23
            }
        },
        {
            "season_id": "2020-2021",
            "competition_name": "Premier League",
            "#_squads": 20,
            "champion": "Manchester City",
            "top_scorer": {
                "player": "Harry Kane",
                "goals_scored": 23
            }
        },
        ]
}
Notes

Meta-data, when available, includes:

season_id (str): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league.
competition_name (str): Name of the league; typically consistent across seasons, although it does change on rare occasions.
num_squads (int): Number of teams that competed in the league-season.
champion (str): Name of the team that won the competition for the specified league-season.
top_scorer (dict): Dictionary containing player(s) name (str) and number of goals scored (int) by the top scorer for the specified league-season.
League Season Details
Endpoint to retrieve meta-data for a specific league id and season id.

Parameters:

league_id (int): Integer representing a league’s football reference id
season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id
Response:

{
    "data": {
        "lg_id": 8,
        "season_id": "2018-2019",
        "league_start": "2018-09-18",
        "league_end": "Date",
        "league_type": "cup",
        "has_adv_stats": "yes",
        "rounds": [
            "Round of 16",
            "Final",
            "Quarter-finals",
            "Semi-finals",
            "Group stage"
        ]
    }
}
Notes

Meta-data, when available, includes:

league_start (str): String date in ‘%Y-%m-%d’ format representing the first match date for the given league-season.
league_end (str): String date in ‘%Y-%m-%d’ format representing the last match date for the given league-season. Note: If the season has a round format and is still in progress, the actual last match date may be inaccurate due to the currently unknown final match date.
league_type (str): Either ‘cup’ or ‘league’.
has_adv_stats (str): Either ‘yes’ or ‘no’; identifies whether advanced stats are available for the specific league-season.
rounds (list of str): List of names of rounds if a league has a multiple round format.
League Standings
Endpoint to retrieve all standings tables for a given league and season id. If no season id is passed, retrieve standings tables for current season.Standings data varies based on both league type (league or cup) and whether or not the league has advanced stats available on football reference.

Parameters:

league_id (int): Integer representing a league’s football reference id
season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id
Response:

{
    "data": [
        {
            "standings_type": "Regular season Table",
            "standings": [
                {
                    "rk": 1,
                    "team_name": "Leicester City",
                    "team_id": "a2d435b3",
                    "mp": 46,
                    "w": 31,
                    "d": 4,
                    "l": 11,
                    "gf": 89,
                    "ga": 41,
                    "gd": "+48",
                    "pts": 97,
                    "pts/mp": 2.11,
                    "xg": 84.9,
                    "xga": 42.7,
                    "xgd": "+42.2",
                    "xgd/90": "+0.92",
                    "attendance": "31,238",
                    "goalkeeper": "Mads Hermansen",
                    "top_team_scorer": {
                        "player": [
                            "Jamie Vardy"
                        ],
                        "goals_scored": 18
                    }
                },
                {
                    "rk": 2,
                    "team_name": "Ipswich Town",
                    "team_id": "b74092de",
                    "mp": 46,
                    "w": 28,
                    "d": 12,
                    "l": 6,
                    "gf": 92,
                    "ga": 57,
                    "gd": "+35",
                    "pts": 96,
                    "pts/mp": 2.09,
                    "xg": 74.0,
                    "xga": 46.7,
                    "xgd": "+27.4",
                    "xgd/90": "+0.59",
                    "attendance": "28,845",
                    "goalkeeper": "Václav Hladký",
                    "top_team_scorer": {
                        "player": [
                            [
                                "Conor Chaplin",
                                "Nathan Broadhead"
                            ]
                        ],
                        "goals_scored": 13
                    }
                },]
        }]
}
        
Notes

Data when available, includes:

rk (int): Team standings rank.
team_name (str): Team name.
team_id (str): Team football reference ID.
mp (int): Number of matches played.
w (int): Number of wins.
d (int): Number of draws.
l (int): Number of losses.
gf (int): Goals scored.
ga (int): Goals scored against.
gd (str): Goal differential (gf - ga).
pts (int): Points won during the season; most leagues award 3 points for a win, 1 for a draw, 0 for a loss.
xg (float): Total expected goals.
xga (float): Total expected goals against.
xgd (str): Expected goals diff (xg - xga).
xgd/90 (str): Expected goal difference per 90 minutes.
Teams
Endpoint to retrieve football reference team data for a given team and, optionally, season. Team data is grouped into two categories:

team_roster: Contains meta-data for all players who participated for the specified team and season.

team_schedule: Contains meta-data for all matches played by the specified team and season.

Parameters:

team_id (str): 8-character string representing a team’s football reference id
season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id
Response:

{
    "team_roster": {
        "data": [
            {
                "player": "Guglielmo Vicario",
                "player_id": "77d6fd4d",
                "nationality": "ITA",
                "position": "GK",
                "age": 26,
                "mp": 38,
                "starts": 38
            },
            {
                "player": "Pedro Porro",
                "player_id": "27d0a506",
                "nationality": "ESP",
                "position": "DF",
                "age": 23,
                "mp": 35,
                "starts": 35
            },]
    },
    "team_schedule": {
        "data": [
            {
                "date": "2023-08-13",
                "time": "14:00",
                "match_id": "67ed3ba2",
                "league_name": "Premier League",
                "league_id": 9,
                "opponent": "Brentford",
                "opponent_id": "cd051869",
                "home_away": "Away",
                "result": "D",
                "gf": 2,
                "ga": 2,
                "attendance": "17,066",
                "captain": "Son Heung-min",
                "formation": "4-2-3-1",
                "referee": "Robert Jones"
            },
            {
                "date": "2023-08-19",
                "time": "17:30",
                "match_id": "4bb62251",
                "league_name": "Premier League",
                "league_id": 9,
                "opponent": "Manchester Utd",
                "opponent_id": "19538871",
                "home_away": "Home",
                "result": "W",
                "gf": 2,
                "ga": 0,
                "attendance": "61,910",
                "captain": "Son Heung-min",
                "formation": "4-2-3-1",
                "referee": "Michael Oliver"
            },
            ]
    },
}
Notes

Team Roster meta-data:

player: str; name of player
player_id: str; 8-character football reference player id string
nationality: str; three-letter football reference country_code to which player belongs
position: str or list of str; position(s) played by player over course of season
age: int; age at start of season
mp: int; number of matches played
starts: int; number of matches started
Team Schedule meta-data:

date: str; date of match in %Y-%m-%d format
time: str; time of match (GMT) in %H:%M format
match_id: str; 8-character football reference match id string
league_name: str; name of league that match was played in
league_id: int; football reference league id number
opponent: str; name of match opponent
opponent_id: str; 8-character football reference opponent team id string
home_away: str; whether game was played home, away or neutral
result: str; result of game from specified team’s perspective
gf: int; goals scored by team in match
ga: int; goals scored by opponent in match
attendance: str; number of people who attended match
captain: str; name of team captain in match
formation: str; formation played by team at start of match
referee: str; name of match referee
Players
Endpoint to retrieve football reference player data for a given player id.

Parameters:

player_id (str): 8-character string representing a player’s football reference id
Response:

{
    "player_id": "4806ec67",
    "full_name": "Jordan Pickford",
    "positions": [
        "GK"
    ],
    "footed": "Left",
    "date_of_birth": "1994-03-07",
    "birth_city": "Washington",
    "nationality": "England",
    "wages": "125000 Weekly",
    "height": 185.0,
    "photo_url": "https://fbref.com/req/202302030/images/headshots/4806ec67_2022.jpg",
    "birth_country": "United Kingdom",
    "weight": 77.0
}
Notes

Player meta-data, when available includes:

player_id - str; 8-character football reference player id
full_name - str; player name
positions - list of str; list of positions player plays in
footed - str; whether a player is primarily right or left footed
date_of_birth - str; date of birth in %Y-%m-%d format
nationality - str; full country name of player nationality
wages - str; amount of wages and how often wage is paid
height - float; height in centimeters
photo_url - str; URL containing player photo
birth_country - str; full country of birth name
weight - float; player weight in kg
Matches
Endpoint to retrieve match meta-data from Football Reference.

There are two distinct match data returned by this class:

Team match data - When a team id is passed, this signals to the class to retrieve match meta-data for a specific team

League match data - When a team id is not passed but a league id is, this indicates to the class to retrieve match meta-data for a specific league

match_id retrieved by this endpoint can be used to retrieve data in the all_players_match_stats endpoint
Parameters: - team_id (str): 8-character string representing a team’s football reference id - league_id (int): Integer representing a league’s football reference id - season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id

Response: Team Match Data:

{
    "data": [
        {
            "match_id": "09d8a999",
            "date": "2022-08-06",
            "time": "15:00",
            "round": "Matchweek 1",
            "league_id": 9,
            "home_away": "Home",
            "opponent": "Southampton",
            "opponent_id": "33c895d4",
            "result": "W",
            "gf": 4,
            "ga": 1,
            "formation": "3-4-3",
            "attendance": "61,732",
            "captain": "Hugo Lloris",
            "referee": "Andre Marriner"
        },
        {
            "match_id": "01e57bf5",
            "date": "2022-08-14",
            "time": "16:30",
            "round": "Matchweek 2",
            "league_id": 9,
            "home_away": "Away",
            "opponent": "Chelsea",
            "opponent_id": "cff3d9bb",
            "result": "D",
            "gf": 2,
            "ga": 2,
            "formation": "3-4-3",
            "attendance": "39,946",
            "captain": "Hugo Lloris",
            "referee": "Anthony Taylor"
        },
        ]
}
League Match Data:

{
    "data": [
        {
            "match_id": "089c98e2",
            "date": "2022-07-30",
            "time": "15:00",
            "round": "Regular season",
            "wk": "1",
            "home": "Wycombe",
            "home_team_id": "43c2583e",
            "away": "Burton Albion",
            "away_team_id": "b09787c5",
            "home_team_score": null,
            "away_team_score": null,
            "venue": "Adams Park",
            "attendance": "5,772",
            "referee": "Gavin Ward"
        },
        {
            "match_id": "178b072c",
            "date": "2022-07-30",
            "time": "15:00",
            "round": "Regular season",
            "wk": "1",
            "home": "Lincoln City",
            "home_team_id": "d76b7bed",
            "away": "Exeter City",
            "away_team_id": "05791fbc",
            "home_team_score": null,
            "away_team_score": null,
            "venue": "Sincil Bank Stadium",
            "attendance": "8,162",
            "referee": "Andy Haines"
        },
        ]
}
Notes

Team match meta-data when available includes:

match_id - str; 8-character football reference match identification
date - str; date of match in %Y-%m-%d format
time - str; time in %H-%M format
round - str; name of round or matchweek number
league_id - int; football reference league identification that match was played under
home_away - str; whether team played the match at home, neutral or away
opponent - str; name of opposing team
opponent_id - str; 8-character football reference identification of opposing team
result - str; result of match (W = win, L = loss, D = draw)
gf - int; number of goals scored by team in match
ga - int; number of goals conceded by team in match
formation - str; formation played by team
attendance - str; number of people in attendance
captain - str; name of team captain for match
referee - str; name of referee for match
League match meta-data when available includes:

match_id - str; 8-character football reference match identification
date - str; date of match in %Y-%m-%d format
time - str; time in %H-%M format
wk - str; name of matchweek if applicable
round - str; name of round if applicable
home - str; name of home team
home_team_id - str; 8-character football reference identification of home team
away - str; name of away team
away_team_id - str; 8-character football reference identification of away team
home_team_score - int; number of goals scored by home team in match
away_team_score - int; number of goals scored by away team in match
venue - str; name of venue played at
attendance - str; number of people in attendance
referee - str; name of referee for match
Team Season Stats
Endpoint to retrieve season-level team statistical data for a specified league and season. Statistics are aggregate, average, or per 90 statistics over the course of a single season.

Parameters:

league_id (int): Integer representing a league’s football reference id
season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id
Response:

{
    "data": [
        {
            "meta_data": {
                "team_id": "18bb7c10",
                "team_name": "Arsenal"
            },
            "stats": {
                "stats": {
                    "roster_size": 28,
                    "matches_played": 38,
                    "ttl_gls": 69,
                    "ttl_ast": 52,
                    "ttl_non_pen_gls": 65,
                    "ttl_xg": 60.1,
                    "ttl_non_pen_xg": 56.0,
                    "ttl_xag": 46.7,
                    "ttl_pk_made": 4,
                    "ttl_pk_att": 5,
                    "ttl_yellow_cards": 74,
                    "ttl_red_cards": 2,
                    "ttl_carries_prog": 868,
                    "ttl_passes_prog": 1874,
                    "avg_gls": 1.82,
                    "avg_ast": 1.37,
                    "avg_non_pen_gls": 1.71,
                    "avg_xg": 1.58,
                    "avg_xag": 1.23,
                    "avg_non_pen_xg": 1.47
                },
                "keepers": {
                    "ttl_gls_ag": 51,
                    "avg_gls_ag": 1.34,
                    "sot_ag": 182,
                    "ttl_saves": 132,
                    "save_pct": 75.8,
                    "clean_sheets": 8,
                    "clean_sheet_pct": 21.1,
                    "pk_att_ag": 7,
                    "pk_made_ag": 7,
                    "pk_saved": 0,
                    "pk_miss_ag": 0,
                    "pk_save_pct": 0.0
                },
                "keepersadv": {
                    "ttl_pk_att_ag": 7,
                    "ttl_fk_gls_ag": 1,
                    "ttl_ck_gls_ag": 3,
                    "ttl_og_ag": 1,
                    "ttl_psxg": 53.5,
                    "psxg_per_sot": 0.26,
                    "ttl_launched_pass_cmp": 159,
                    "ttl_launched_pass_att": 478,
                    "pct_launched_pass_cmp": 33.3,
                    "ttl_pass_att": 1093,
                    "ttl_throws_att": 227,
                    "pct_passes_launched": 29.2,
                    "avg_pass_len": 31.7,
                    "ttl_gk_att": 280,
                    "pct_gk_launch": 56.8,
                    "avg_gk_len": 45.5,
                    "ttl_crosses_faced": 489,
                    "ttl_crosses_stopped": 16,
                    "pct_crosses_stopped": 3.3,
                    "ttl_def_action_outside_box": 48,
                    "avg_def_action_outside_box": 1.26,
                    "avg_dist_def_action_outside_box": 12.9
                },
                "shooting": {
                    "ttl_sh": 462,
                    "ttl_sot": 159,
                    "pct_sot": 34.4,
                    "avg_sh": 12.16,
                    "avg_sot": 4.18,
                    "gls_per_sh": 0.14,
                    "gls_per_sot": 0.41,
                    "avg_sh_dist": 16.7,
                    "ttl_fk_sh": 11,
                    "npxg_per_sh": 0.12,
                    "ttl_gls_xg_diff": 8.9,
                    "ttl_non_pen_gls_xg_diff": 9.0
                },
                "passing": {
                    "ttl_pass_cmp": 18425,
                    "pct_pass_cmp": 81.7,
                    "pass_ttl_dist": 313400,
                    "ttl_pass_cmp_s": 8573,
                    "ttl_pass_att_s": 9619,
                    "pct_pass_cmp_s": 89.1,
                    "ttl_pass_cmp_m": 7384,
                    "ttl_pass_att_m": 8450,
                    "pct_pass_cmp_m": 87.4,
                    "ttl_pass_cmp_l": 1716,
                    "ttl_pass_att_l": 2882,
                    "pct_pass_cmp_l": 59.5,
                    "ttl_xa": 43.9,
                    "ttl_ast_xag_diff": 5.3,
                    "ttl_pass_prog": 1874,
                    "pass_prog_ttl_dist": 105044,
                    "ttl_key_passes": 363,
                    "ttl_pass_fthird": 1220,
                    "ttl_pass_opp_box": 417,
                    "ttl_cross_opp_box": 63
                },
                "passing_types": {
                    "ttl_pass_live": 20518,
                    "ttl_pass_dead": 1942,
                    "ttl_pass_fk": 543,
                    "ttl_through_balls": 65,
                    "ttl_switches": 152,
                    "ttl_crosses": 605,
                    "ttl_pass_offside": 89,
                    "ttl_pass_blocked": 453,
                    "ttl_throw_ins": 823,
                    "ttl_ck": 209,
                    "ck_in_swinger": 59,
                    "ck_out_swinger": 65,
                    "ck_straight": 2
                },
                "gca": {
                    "ttl_sca": 831,
                    "avg_sca": 21.87,
                    "ttl_pass_live_sca": 655,
                    "ttl_take_on_sca": 50,
                    "ttl_sh_sca": 34,
                    "ttl_fld_sca": 22,
                    "ttl_def_sca": 12,
                    "ttl_gca": 116,
                    "avg_gca": 3.05,
                    "ttl_pass_live_gca": 91,
                    "ttl_pass_dead_gca": 6,
                    "ttl_take_on_gca": 5,
                    "ttl_sh_gca": 6,
                    "ttl_fld_gca": 7,
                    "ttl_def_gca": 1
                },
                "defense": {
                    "ttl_tkl": 609,
                    "ttl_tkl_won": 366,
                    "ttl_tkl_def_third": 294,
                    "ttl_tkl_mid_third": 236,
                    "ttl_tkl_att_third": 79,
                    "ttl_tkl_drb": 228,
                    "ttl_tkl_drb_att": 535,
                    "pct_tkl_drb_suc": 42.6,
                    "ttl_blocks": 424,
                    "ttl_sh_blocked": 118,
                    "ttl_int": 412,
                    "ttl_tkl_plus_int": 1021,
                    "ttl_clearances": 798,
                    "ttl_def_error": 28
                },
                "possession": {
                    "avg_poss": "58.1",
                    "ttl_touches": 26670,
                    "ttl_touch_def_box": 2457,
                    "ttl_touch_def_third": 7996,
                    "ttl_touch_mid_third": 12381,
                    "ttl_touch_fthird": 6492,
                    "ttl_touch_opp_box": 984,
                    "ttl_touch_live": 26665,
                    "ttl_take_on_att": 536,
                    "ttl_take_on_suc": 304,
                    "pct_take_on_suc": 56.7,
                    "ttl_take_on_tkld": 232,
                    "pct_take_on_tkld": 43.3,
                    "ttl_carries": 14890,
                    "ttl_carries_dist": 82862,
                    "ttl_carries_prog_dist": 44451,
                    "ttl_carries_fthird": 591,
                    "ttl_carries_opp_box": 203,
                    "ttl_carries_miscontrolled": 564,
                    "ttl_carries_dispossessed": 409,
                    "ttl_pass_recvd": 18303,
                    "ttl_pass_prog_rcvd": 1869
                },
                "playingtime": {
                    "avg_age": 26.7,
                    "avg_min_starter": 83.0,
                    "ttl_subs": 113,
                    "avg_min_sub": 26.0
                },
                "misc": {
                    "ttl_second_yellow_cards": 1,
                    "ttl_fls_ag": 412,
                    "ttl_fls_for": 455,
                    "ttl_offside": 89,
                    "ttl_pk_won": 4,
                    "ttl_pk_conceded": 7,
                    "ttl_og": 1,
                    "ttl_ball_recov": 2000,
                    "ttl_air_dual_won": 555,
                    "ttl_air_dual_lost": 637
                }
            }
        },
        ]
}
Notes

Advanced Statistical Categories:

stats - general team stats such as goals and goals against
keepers - general goalkeeping statistics
keepersadv - advanced goalkeeping statistics
shooting - statistics related to shot taking
passing - statistics related to passing performance
passing_types - statistics related to passing types completed
gca - statistics related to goal- and shot-creating actions
defense - statistics related to defense
possession - statistics related to possession
playingtime - statistics related to roster playing time
misc - miscellaneous stats including cards and penalties
Non-Advanced Statistical Categories:

stats
keepers
shooting
playtingtime
misc
Team Match Stats
Endpoint to retrieve match-level team statistical data for a specified team, league and season.

Parameters: - team_id (str): 8-character string representing a team’s football reference id - league_id (int): Integer representing a league’s football reference id - season_id (str): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league

Response:

{
    "data": [
        {
            "meta_data": {
                "match_id": "404ee5d3",
                "date": "2019-08-10",
                "round": "Matchweek 1",
                "home_away": "Away",
                "opponent": "Tottenham",
                "opponent_id": "361ca564"
            },
            "stats": {
                "schedule": {
                    "time": "17:30",
                    "result": "L",
                    "gls": 1,
                    "gls_ag": 3,
                    "xg": 0.7,
                    "xga": 2.4,
                    "poss": 30,
                    "attendance": "60,407",
                    "captain": "Jack Grealish",
                    "formation": "4-1-4-1",
                    "referee": "Chris Kavanagh"
                },
                "keeper": {
                    "sot_ag": 6,
                    "saves": 3,
                    "save_pct": 50.0,
                    "clean_sheets": 0,
                    "psxg": 2.0,
                    "psxg_gls_ag_diff": -1.0,
                    "pk_att": 0,
                    "pk_made_ag": 0,
                    "pk_saved": 0,
                    "pk_miss_ag": 0,
                    "launched_pass_cmp": 9,
                    "launched_pass_att": 25,
                    "pct_launched_pass_cmp": 36.0,
                    "pass_att": 22,
                    "throws_att": 4,
                    "pct_gk_launch": 76.9,
                    "avg_pass_len": 49.2,
                    "gk_att": 13,
                    "avg_gk_len": 56.1,
                    "crosses_faced": 28,
                    "crosses_stopped": 1,
                    "pct_crosses_stopped": 3.6,
                    "def_action_outside_box": 2,
                    "avg_dist_def_action_outside_box": 18.7
                },
                "shooting": {
                    "sh": 7,
                    "sot": 4,
                    "pct_sot": 57.1,
                    "gls_per_sh": 0.14,
                    "gls_per_sot": 0.25,
                    "avg_sh_dist": 19.8,
                    "fk_sh": 0,
                    "pk_made": 0,
                    "non_pen_xg": 0.7,
                    "npxg_per_sh": 0.09,
                    "gls_xg_diff": 0.3,
                    "non_pen_gls_xg_diff": 0.3
                },
                "passing": {
                    "pass_cmp": 214,
                    "pct_pass_cmp": 77.3,
                    "pass_ttl_dist": 4137,
                    "pass_prog_ttl_dist": 1842,
                    "pass_cmp_s": 97,
                    "pass_att_s": 107,
                    "pct_pass_cmp_s": 90.7,
                    "pass_cmp_m": 90,
                    "pass_att_m": 103,
                    "pct_pass_cmp_m": 87.4,
                    "pass_cmp_l": 24,
                    "pass_att_l": 53,
                    "pct_pass_cmp_l": 45.3,
                    "ast": 1,
                    "xag": 0.7,
                    "xa": 0.2,
                    "pass_prog": 17,
                    "key_passes": 7,
                    "pass_fthird": 17,
                    "pass_opp_box": 4,
                    "cross_opp_box": 2
                },
                "passing_types": {
                    "pass_live": 237,
                    "pass_dead": 40,
                    "pass_fk": 14,
                    "through_balls": 1,
                    "switches": 3,
                    "crosses": 8,
                    "pass_offside": 0,
                    "pass_blocked": 8,
                    "throw_ins": 9,
                    "ck": 0,
                    "ck_in_swinger": 0,
                    "ck_out_swinger": 0,
                    "ck_straight": 0
                },
                "gca": {
                    "sca": 9,
                    "pass_live_sca": 8,
                    "pass_dead_sca": 0,
                    "take_on_sca": 0,
                    "sh_sca": 0,
                    "fld_sca": 0,
                    "def_sca": 1,
                    "gca": 2,
                    "pass_live_gca": 2,
                    "pass_dead_gca": 0,
                    "take_on_gca": 0,
                    "sh_gca": 0,
                    "fld_gca": 0,
                    "def_gca": 0
                },
                "defense": {
                    "tkl": 29,
                    "tkl_won": 13,
                    "tkl_def_third": 18,
                    "tkl_mid_third": 8,
                    "tkl_att_third": 3,
                    "tkl_drb": 14,
                    "tkl_drb_att": 25,
                    "pct_tkl_drb_suc": 56.0,
                    "blocks": 18,
                    "sh_blocked": 11,
                    "int": 9,
                    "tkl_plus_int": 38,
                    "clearances": 46,
                    "def_error": 1
                },
                "possession": {
                    "touches": 422,
                    "touch_def_box": 104,
                    "touch_def_third": 220,
                    "touch_mid_third": 152,
                    "touch_fthird": 55,
                    "touch_opp_box": 8,
                    "touch_live": 422,
                    "take_on_att": 8,
                    "take_on_suc": 4,
                    "pct_take_on_suc": 50.0,
                    "take_on_tkld": 4,
                    "pct_take_on_tkld": 50.0,
                    "carries": 183,
                    "ttl_carries_dist": 1063,
                    "ttl_carries_prog_dist": 557,
                    "carries_prog": 6,
                    "carries_fthird": 8,
                    "carries_opp_box": 0,
                    "carries_miscontrolled": 13,
                    "carries_dispossessed": 13,
                    "pass_recvd": 213,
                    "pass_prog_rcvd": 17
                },
                "misc": {
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "second_yellow_cards": 0,
                    "fls_com": 9,
                    "fls_drawn": 13,
                    "offside": 0,
                    "pk_won": 0,
                    "pk_conceded": 0,
                    "ball_recov": 39,
                    "air_dual_won": 12,
                    "air_dual_lost": 10,
                    "pct_air_dual_won": 54.5
                }
            }
        },
        ]
}
Notes

Meta-data, when available, includes:

This class provides both meta-data related to each match and team statistics in covering various statistical categories.

Match meta-data when available includes:

match_id - str; 8-character football reference match id
date - str; date of match in %Y-%m-%d format
round - str; name of round or matchweek number
home_away - str; whether match was played ‘Home’ or ‘Away’ or ‘Neutral’
opponent - str; name of opposing team
opponent_id - str; 8-character football reference team id of opponent
Advanced Statistical Categories:

schedule - general team stats such as goals and goals against
keeper - all goalkeeping related stats
shooting - statistics related to team shot taking
passing - statistics related to passing performance
passing_types - statistics related to passing types completed
gca - statistics related to goal- and shot-creating actions
defense - statistics related to defense
possession - statistics related to possession
misc - miscellaneous stats including cards and penalties
Non-Advanced Statistical Categories:

schedule
keeper
shooting
misc
Player Season Stats
Endpoint to retrieve season-level player statistical data for a specified team, league and season. Statistics are aggregate, average, or per 90 statistics over the course of a single season.

Parameters:

team_id (str): 8-character string representing a team’s football reference id
league_id (int): Integer representing a league’s football reference id
season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id
Response:

{
    "players": [
        {
            "meta_data": {
                "player_id": "8b04d6c1",
                "player_name": "Pierre Højbjerg",
                "player_country_code": "DEN",
                "age": 24
            },
            "stats": {
                "stats": {
                    "positions": "MF",
                    "matches_played": 38,
                    "starts": 38,
                    "min": 3420,
                    "gls": 2,
                    "ast": 4,
                    "gls_and_ast": 6,
                    "non_pen_gls": 2,
                    "xg": 1.1,
                    "non_pen_xg": 1.1,
                    "xag": 1.6,
                    "pk_made": 0,
                    "pk_att": 0,
                    "yellow_cards": 9,
                    "red_cards": 0,
                    "carries_prog": 36,
                    "passes_prog": 218,
                    "per90_gls": 0.05,
                    "per90_ast": 0.11,
                    "per90_non_pen_gls": 0.05,
                    "per90_xg": 0.03,
                    "per90_xag": 0.04,
                    "per90_non_pen_xg": 0.03
                },
                "shooting": {
                    "sh": 14,
                    "sot": 7,
                    "pct_sot": 50.0,
                    "per90_sh": 0.37,
                    "per90_sot": 0.18,
                    "gls_per_sh": 0.14,
                    "gls_per_sot": 0.29,
                    "avg_sh_dist": 24.0,
                    "fk_sh": 0,
                    "npxg_per_sh": 0.08,
                    "gls_xg_diff": 0.9,
                    "non_pen_gls_xg_diff": 0.9
                },
                "passing": {
                    "pass_cmp": 2455,
                    "pass_att": 2783,
                    "pct_pass_cmp": 88.2,
                    "pass_ttl_dist": 40417,
                    "pass_cmp_s": 1161,
                    "pass_att_s": 1263,
                    "pct_pass_cmp_s": 91.9,
                    "pass_cmp_m": 1033,
                    "pass_att_m": 1129,
                    "pct_pass_cmp_m": 91.5,
                    "pass_cmp_l": 173,
                    "pass_att_l": 257,
                    "pct_pass_cmp_l": 67.3,
                    "xa": 1.3,
                    "ast_xag_diff": 2.4,
                    "pass_prog": 218,
                    "pass_prog_ttl_dist": 12152,
                    "key_passes": 16,
                    "pass_fthird": 208,
                    "pass_opp_box": 17,
                    "cross_opp_box": 1
                },
                "passing_types": {
                    "pass_live": 2668,
                    "pass_dead": 110,
                    "pass_fk": 100,
                    "through_balls": 2,
                    "switches": 19,
                    "crosses": 6,
                    "pass_offside": 5,
                    "pass_blocked": 23,
                    "throw_ins": 7,
                    "ck": 0,
                    "ck_in_swinger": 0,
                    "ck_out_swinger": 0,
                    "ck_straight": 0
                },
                "gca": {
                    "ttl_sca": 59,
                    "per90_sca": 1.55,
                    "pass_live_sca": 52,
                    "pass_dead_sca": 3,
                    "take_on_sca": 0,
                    "sh_sca": 2,
                    "fld_sca": 1,
                    "def_sca": 1,
                    "gca": 10,
                    "per90_gca": 0.26,
                    "pass_live_gca": 9,
                    "pass_dead_gca": 1,
                    "take_on_gca": 0,
                    "sh_gca": 0,
                    "fld_gca": 0,
                    "def_gca": 0
                },
                "defense": {
                    "tkl": 98,
                    "tkl_won": 51,
                    "tkl_def_third": 45,
                    "tkl_mid_third": 42,
                    "tkl_att_third": 11,
                    "tkl_drb": 54,
                    "tkl_drb_att": 129,
                    "pct_tkl_drb_suc": 41.9,
                    "blocks": 51,
                    "sh_blocked": 9,
                    "int": 48,
                    "tkl_plus_int": 146,
                    "clearances": 66,
                    "def_error": 0
                },
                "possession": {
                    "touches": 3116,
                    "touch_def_box": 120,
                    "touch_def_third": 712,
                    "touch_mid_third": 2126,
                    "touch_fthird": 308,
                    "touch_opp_box": 20,
                    "touch_live": 3116,
                    "take_on_att": 32,
                    "take_on_suc": 23,
                    "pct_take_on_suc": 71.9,
                    "take_on_tkld": 9,
                    "pct_take_on_tkld": 28.1,
                    "carries": 1794,
                    "ttl_carries_dist": 8521,
                    "ttl_carries_prog_dist": 4176,
                    "carries_fthird": 33,
                    "carries_opp_box": 2,
                    "carries_miscontrolled": 37,
                    "carries_dispossessed": 20,
                    "pass_recvd": 2224,
                    "pass_prog_rcvd": 26
                },
                "playingtime": {
                    "min_per_match_played": 90.0,
                    "pct_squad_min": 100.0,
                    "avg_min_starter": 90.0,
                    "subs": 0,
                    "avg_min_sub": null,
                    "unused_sub": 0,
                    "team_gls_on_pitch": 68,
                    "team_gls_ag_on_pitch": 45,
                    "per90_plus_minus": "+0.61",
                    "per90_on_off": "",
                    "team_xg_on_pitch": 53.1,
                    "team_xg_ag_on_pitch": 49.1,
                    "per90_x_plus_minus": "+0.10",
                    "per90_x_on_off": ""
                },
                "misc": {
                    "second_yellow_cards": 0,
                    "fls_com": 69,
                    "fls_drawn": 53,
                    "offside": 0,
                    "pk_won": 0,
                    "pk_conceded": 1,
                    "og": 0,
                    "ball_recov": 296,
                    "air_dual_won": 43,
                    "air_dual_lost": 36,
                    "pct_air_dual_won": 54.4
                }
            }
        },
        ]
}
Notes

Advanced Player Statistical Categories:

stats - general team stats such as goals and goals against
shooting - statistics related to shot taking
passing - statistics related to passing performance
passing_types - statistics related to passing types completed
gca - statistics related to goal- and shot-creating actions
defense - statistics related to defense
possession - statistics related to possession
playingtime - statistics related to roster playing time
misc - miscellaneous stats including cards and penalties
Advanced Keeper Statistical Categories:

keepers - general goalkeeping statistics
keepersadv - advanced goalkeeping statistics
Non-Advanced Player Statistical Categories:

stats
keepers
shooting
playingtime
misc
Non-Advanced Keeper Statistical Categories:

keepers - general goalkeeping statistics
Player Meta-data:

player_id - str; 8-character football reference player identification
player_name - str; name of player
player_country_code - str; 3-digit country code attributed to player
age - int; integer age of player at start of season
Player Match Stats
Endpoint to retrieve match-level player statistical data for a specified player, league and season.

Parameters: - player_id (str): 8-character football reference player identification - league_id (int): Integer representing a league’s football reference id - season_id (str, optional): Football reference season that is either in “%Y” or “%Y-%Y” format, depending on the league. If not provided, endpoint retrieves data for most recent season for provided league_id

Response:

{
    "data": [
        {
            "meta_data": {
                "match_id": "18697d81",
                "date": "2022-08-17",
                "round": "Apertura 2022 Regular Season",
                "home_away": "Away",
                "team_name": "Monterrey",
                "team_id": "dd5ca9bd",
                "opponent": "Toluca",
                "opponent_id": "44b88a4e"
            },
            "stats": {
                "summary": {
                    "result": "D 1–1",
                    "start": "Y",
                    "positions": "GK",
                    "min": "90",
                    "gls": 0,
                    "sh": 0,
                    "sot": 0,
                    "xg": 0.0,
                    "non_pen_xg": 0.0,
                    "ast": 0,
                    "xag": 0.0,
                    "pass_cmp": 20,
                    "pass_att": 26,
                    "pct_pass_cmp": 76.9,
                    "pass_prog": 0,
                    "sca": 1,
                    "gca": 0,
                    "touches": 28,
                    "take_on_att": 0,
                    "take_on_suc": 0,
                    "tkl": 0,
                    "int": 0,
                    "blocks": 0,
                    "yellow_cards": 0,
                    "red_cards": 0,
                    "pk_made": 0,
                    "pk_att": 0
                },
                "passing": {
                    "pass_ttl_dist": 579,
                    "pass_prog_ttl_dist": 438,
                    "pass_cmp_s": 4,
                    "pass_att_s": 4,
                    "pct_pass_cmp_s": 100.0,
                    "pass_cmp_m": 9,
                    "pass_att_m": 9,
                    "pct_pass_cmp_m": 100.0,
                    "pass_cmp_l": 7,
                    "pass_att_l": 13,
                    "pct_pass_cmp_l": 53.8,
                    "xa": 0.0,
                    "key_passes": 0,
                    "pass_fthird": 1,
                    "pass_opp_box": 0,
                    "cross_opp_box": 0
                },
                "passing_types": {
                    "pass_live": 20,
                    "pass_dead": 6,
                    "pass_fk": 2,
                    "through_balls": 0,
                    "switches": 0,
                    "crosses": 0,
                    "pass_offside": 0,
                    "pass_blocked": 0,
                    "throw_ins": 0,
                    "ck": 0,
                    "ck_in_swinger": 0,
                    "ck_out_swinger": 0,
                    "ck_straight": 0
                },
                "gca": {
                    "ttl_sca": 1,
                    "pass_live_sca": 1,
                    "pass_dead_sca": 0,
                    "take_on_sca": 0,
                    "sh_sca": 0,
                    "fld_sca": 0,
                    "def_sca": 0,
                    "pass_live_gca": 0,
                    "pass_dead_gca": 0,
                    "take_on_gca": 0,
                    "sh_gca": 0,
                    "fld_gca": 0,
                    "def_gca": 0
                },
                "defense": {
                    "tkl_won": 0,
                    "tkl_def_third": 0,
                    "tkl_mid_third": 0,
                    "tkl_att_third": 0,
                    "tkl_drb": 0,
                    "tkl_drb_att": 0,
                    "pct_tkl_drb_suc": null,
                    "sh_blocked": 0,
                    "tkl_plus_int": 0,
                    "clearances": 1,
                    "def_error": 0
                },
                "possession": {
                    "touch_def_box": 23,
                    "touch_def_third": 28,
                    "touch_mid_third": 0,
                    "touch_fthird": 0,
                    "touch_opp_box": 0,
                    "touch_live": 28,
                    "pct_take_on_suc": null,
                    "take_on_tkld": 0,
                    "pct_take_on_tkld": null,
                    "carries": 18,
                    "ttl_carries_dist": 94,
                    "ttl_carries_prog_dist": 58,
                    "carries_prog": 0,
                    "carries_fthird": 0,
                    "carries_opp_box": 0,
                    "carries_miscontrolled": 1,
                    "carries_dispossessed": 0,
                    "pass_recvd": 9,
                    "pass_prog_rcvd": 0
                },
                "misc": {
                    "second_yellow_cards": 0,
                    "fls_com": 0,
                    "fls_drawn": 0,
                    "offside": 0,
                    "pk_won": 0,
                    "pk_conceded": 0,
                    "og": 0,
                    "ball_recov": 0,
                    "air_dual_won": 0,
                    "air_dual_lost": 0,
                    "pct_air_dual_won": null
                }
            }
        },
        ]
}
Notes IMPORTANT

For players where advanced stats are available, stat id types must be pulled one at a time. Football Reference has a scraping restriction of one every 6 seconds.

Therefore the main class functionality will take over 24 seconds to run each time

This class provides both meta-data related to each match and player statistics in covering various statistical categories.

Match Meta-data:

match_id - str; 8-character football reference match id
date - str; date of match in %Y-%m-%d format
round - str; name of round or matchweek number
home_away - str; whether match was played ‘Home’ or ‘Away’ or ‘Neutral’
team_name - str; name of team that player played for
team_id - str; 8-character football reference team id for team player played for
opponent - str; name of opposing team
opponent_id - str; 8-character football reference team id of opponent
Advanced Statistical Player Categories:

summary - general team stats such as goals and goals against
passing - statistics related to passing performance
passing_types - statistics related to passing types completed
gca - statistics related to goal- and shot-creating actions
defense - statistics related to defense
possession - statistics related to possession
misc - miscellaneous stats including cards and penalties
Non-Advanced Statistical Categories:

summary
All Players Match Stats
Endpoint to retrieve match-level player statistical data for both teams for a specified match id

Parameters: - match_id (str): 8-character football reference match identification

Response:

{
    "data": [
        {
            "team_name": "Tottenham",
            "home_away": "home",
            "players": [
                {
                    "meta_data": {
                        "player_id": "fa031b34",
                        "player_name": "Richarlison",
                        "player_country_code": "BRA",
                        "player_number": "9",
                        "age": "26"
                    },
                    "stats": {
                        "summary": {
                            "positions": "FW",
                            "min": "69",
                            "gls": 0,
                            "sh": 0,
                            "sot": 0,
                            "xg": 0.0,
                            "non_pen_xg": 0.0,
                            "ast": 0,
                            "xag": 0.0,
                            "pass_cmp": 9,
                            "pass_att": 14,
                            "pct_pass_cmp": 64.3,
                            "pass_prog": 0,
                            "sca": 1,
                            "gca": 0,
                            "touches": 24,
                            "carries": 20,
                            "carries_prog": 1,
                            "take_on_att": 3,
                            "take_on_suc": 1,
                            "tkl": 0,
                            "int": 0,
                            "blocks": 1,
                            "yellow_cards": 0,
                            "red_cards": 0,
                            "pk_made": 0,
                            "pk_att": 0
                        },
                        "passing": {
                            "pass_ttl_dist": 193,
                            "pass_prog_ttl_dist": 30,
                            "pass_cmp_s": 3,
                            "pass_att_s": 4,
                            "pct_pass_cmp_s": 75.0,
                            "pass_cmp_m": 3,
                            "pass_att_m": 4,
                            "pct_pass_cmp_m": 75.0,
                            "pass_cmp_l": 2,
                            "pass_att_l": 2,
                            "pct_pass_cmp_l": 100.0,
                            "xa": 0.0,
                            "key_passes": 1,
                            "pass_fthird": 1,
                            "pass_opp_box": 0,
                            "cross_opp_box": 0
                        },
                        "passing_types": {
                            "pass_live": 13,
                            "pass_dead": 1,
                            "pass_fk": 0,
                            "through_balls": 0,
                            "switches": 1,
                            "crosses": 0,
                            "pass_offside": 0,
                            "pass_blocked": 2,
                            "throw_ins": 0,
                            "ck": 0,
                            "ck_in_swinger": 0,
                            "ck_out_swinger": 0,
                            "ck_straight": 0
                        },
                        "defense": {
                            "tkl_won": 0,
                            "tkl_def_third": 0,
                            "tkl_mid_third": 0,
                            "tkl_att_third": 0,
                            "tkl_drb": 0,
                            "tkl_drb_att": 0,
                            "pct_tkl_drb_suc": null,
                            "sh_blocked": 1,
                            "tkl_plus_int": 0,
                            "clearances": 1,
                            "def_error": 0
                        },
                        "possession": {
                            "touch_def_box": 2,
                            "touch_def_third": 4,
                            "touch_mid_third": 9,
                            "touch_fthird": 11,
                            "touch_opp_box": 1,
                            "touch_live": 24,
                            "pct_take_on_suc": 33.3,
                            "take_on_tkld": 2,
                            "pct_take_on_tkld": 66.7,
                            "ttl_carries_dist": 85,
                            "ttl_carries_prog_dist": 9,
                            "carries_fthird": 1,
                            "carries_opp_box": 0,
                            "carries_miscontrolled": 5,
                            "carries_dispossessed": 3,
                            "pass_recvd": 21,
                            "pass_prog_rcvd": 6
                        },
                        "misc": {
                            "second_yellow_cards": 0,
                            "fls_com": 1,
                            "fls_drawn": 0,
                            "offside": 0,
                            "pk_won": 0,
                            "pk_conceded": 0,
                            "og": 0,
                            "ball_recov": 0,
                            "air_dual_won": 0,
                            "air_dual_lost": 5,
                            "pct_air_dual_won": 0.0
                        }
                    }
                },
                ]
        }
        ]
}
Notes

This class provides both meta-data related to each player, and match-level player statistics covering various statistical categories.

Player meta-data:

player_id - str; 8-character football reference player id
player_name - str; name of player
player_country_code - str; 3 letter abbreviation of player country
player_number - str; number of player
age - str; age of player on match date
Advanced Statistical Player Categories:

summary - general team stats such as goals and goals against
passing - statistics related to passing performance
passing_types - statistics related to passing types completed
defense - statistics related to defense
possession - statistics related to possession
misc - miscellaneous stats including cards and penalties
keeper - basic and advanced keeper stats
Non-Advanced Statistical Categories:

summary
keeper - basic keeper stats
Error Handling
The API uses standard HTTP status codes to indicate the success or failure of an API request.

200 OK: The request was successful.
400 Bad Request: The request could not be understood or was missing required parameters.
401 Unauthorized: Authentication failed or user does not have permissions for the requested operation.
404 Not Found: The requested resource could not be found.
500 Internal Server Error: An error occurred on the server.