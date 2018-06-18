var allMatchesURL = 'https://world-cup-json.herokuapp.com/matches'
var todayMatchesURL = 'https://world-cup-json.herokuapp.com/matches/today'
var groupResultsURL = 'https://world-cup-json.herokuapp.com/teams/group_results'
var countryMatchesURL = 'https://world-cup-json.herokuapp.com/matches/country?fifa_code='

var matchCard = Vue.component('match-card', {
  props: ['match'],
  data: function () {
    return {}
  },
  template: `<div class='match-card'>
    <div class='row'>
      <div class='col-md-12'>
        <h5>
          <div class='text-center'>{{ match.location }} at {{ match.venue }} on: {{ convertDate(match.datetime) }}</div>
        </h5>
      </div>
    </div>
    <div class='row'>
      <div class='col'>
        <div class='text-center'>
          <h4 >
            {{ match.home_team.country }} 
            <img class='pb-2' v-bind:src="getFlag(match.home_team.code)" v-bind:alt="match.home_team.code" v-bind:title="match.home_team.code">
          </h4>
        </div>
      </div>
      <div class='col'>
        <div class='text-center'>
          <h4>
            {{ match.away_team.country }}
            <img class='pb-2' v-bind:src="getFlag(match.away_team.code)" v-bind:alt="match.away_team.code" v-bind:title="match.away_team.code">
          </h4>
        </div>
      </div>
    </div>
    <div class='row'>
      <div class='col'>
        <div class='text-center'>
          <h2>
            {{ match.home_team.goals}}
          </h2>
          <button 
            class='btn btn-info' 
            id="show-modal" 
            v-on:click="$emit('open-match-modal', {
              'fifa_id': match.fifa_id, 
              'code': match.home_team.code, 
              'name': match.home_team.country, 
              'home': match.home_team.country, 
              'away': match.away_team.country
            })"
          >More ...</button>
        </div>
      </div>
      <div class='col'>
        <div class='text-center'>
          <h2>
            {{ match.away_team.goals}}
          </h2>
          <button 
            class='btn btn-info' 
            id="show-modal" 
            v-on:click="$emit('open-match-modal', {
              'fifa_id': match.fifa_id, 
              'code': match.away_team.code, 
              'name': match.away_team.country, 
              'home': match.home_team.country, 
              'away': match.away_team.country
            })"
          >More ...</button>
        </div>
      </div>
    </div>
  </div>`,
  methods: {
    convertDate: function(d) {
      return moment(d).local().format('YYYY-MM-DD HH:mm');
    },
    getFlag: function(code) {
      return flags[code]
    }
  }
});

var groupCard = Vue.component('group-card', {
  props: ['group'],
  data: function () {
    return {}
  },
  template: `<div class='col-md-6'>
    <div class="card group-card ">
      <div class="card-body">
       
        <h3 class="card-title text-center">Group {{ group.letter }}</h3>
        <p class="card-text">
          <table class='table table-sm table-hover'>
            <thead>
              <tr>
                <th>Country</th>
                <th>Points</th>
                <th>Wins</th>
                <th>Draws</th>
                <th>Losses</th>
                <th>Goals +</th>
                <th>Goals -</th>
                <!--
                <th>Games</th>
                <th>Goal diff</th>
                -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in group.teams">
                <td>
                  
                  <img class='pb-2' v-bind:src="getFlag(team.team.fifa_code)" v-bind:alt="team.team.fifa_code" v-bind:title="team.team.fifa_code">
                  {{ team.team.country }}
                </td>
                <td>{{ team.team.points }}</td>
                <td>{{ team.team.wins }}</td>
                <td>{{ team.team.draws }}</td>
                <td>{{ team.team.losses }}</td>
                <td>{{ team.team.goals_for }}</td>
                <td>{{ team.team.goals_against }}</td>
                <!--
                <td>{{ team.team.games_played }}</td>
                <td>{{ team.team.goal_differential }}</td>
                -->
              </tr>
            </tbody>
          </table>
        </p>
        
      </div>
    </div>
  </div>`,
  methods: {
    getFlag: function(code) {
      return flags[code]
    }
  }
});

var modalComponent = Vue.component('modal', {
  props: ['modal-info'],
  data: function () {
    return {
      loading: true,
      statistics: {}
    }
  },
  
  template: '#modal-template'
})

var app = new Vue({
  el: '#app',
  data: {
    todayMatches: [],
    allMatches: [],
    groupResults: [],
    date: new Date(),
    showModalMatch: null
  },
  computed: {
    selectedMatches: function() {
      var that = this;
      return this.allMatches.filter(function(m) {
        
        if (moment(m.datetime) > moment(that.date).hours(0).minutes(0) && moment(m.datetime) < moment(that.date).add(1, 'days').hours(0).minutes(0)) {
          console.log(m.datetime)
          return true;
        }
      }).sort(function(a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
      })
    }
  },
  created: function () {
    this.getTodayMatches();
    this.getAllMatches();
    this.getGroupResults();
  },
  methods: {
    openMatchModal: function (modalInfo) {
      console.log("HI")
      console.log(modalInfo)
      this.showModalMatch = modalInfo
      this.loadStats()
    },  
    getTodayMatches: function() {
      var that = this;
      
      fetch(todayMatchesURL).then(function(response) {
        return response.json();
      }).then(function(tm) {
        console.log(tm)
        that.todayMatches = tm;
      });
    },
    getAllMatches: function() {
      var that = this;
      
      fetch(allMatchesURL).then(function(response) {
        return response.json();
      }).then(function(tm) {
        console.log(tm)
        that.allMatches = tm;
      });
    },
    loadStats: function() {
      console.log(this.modalInfo)
      var that = this;

      fetch(countryMatchesURL+that.showModalMatch.code).then(function(response) {
        return response.json();
      }).then(function(tm) {
        var match = tm.filter(function(x) {
          return x.fifa_id == that.showModalMatch.fifa_id;
        })[0]
        console.log("match is ", match)
        if(match.home_team.code == that.showModalMatch.code) {
          that.showModalMatch = Object.assign(
            {}, that.showModalMatch, 
            {'events': match.home_team_events},
            {'statistics': match.home_team_statistics},
          )
        } else {
          that.showModalMatch = Object.assign(
            {}, that.showModalMatch, 
            {'events': match.away_team_events},
            {'statistics': match.away_team_statistics},
          )
        }
      });
    },

    getGroupResults: function() {
      var that = this;
      
      fetch(groupResultsURL).then(function(response) {
        return response.json();
      }).then(function(tm) {
        console.log(tm)
        that.groupResults = tm;
      });
    },

    convertDate: function(d) {
      return moment(d).local().format('YYYY-MM-DD HH:mm');
    },
    customFormatter: function(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    customFormatterWithDay: function(date) {
      return moment(date).format('dddd, YYYY-MM-DD');
    },
    nextDate: function() {
      this.date = moment(this.date).add(1, 'days')
    },
    prevDate: function() {
      this.date = moment(this.date).subtract(1, 'days')
    }
  },
  components: {
  	vuejsDatepicker
  }
})