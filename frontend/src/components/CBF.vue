<script>
import { ref } from 'vue';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import Select2 from 'vue3-select2-component';

import { getCountries } from '@/composables/getCountries';

export default {
  name: 'CBF',
  props: {
    socketUrl: {
      type: String,
      default: '',
    },
  },
  components: {
    Datepicker,
    Select2,
  },
  setup() {
    // VARIABLES
    const date = ref();
    const dateValue = ref({
      start: '2021-12-30 09:00',
      end: '2022-01-01 16:00',
    });
    let socket = ref({});
    let connectedStatus = ref('Not connected');
    let message = ref('No websocket message yet');
    let chartData = ref({
      '00:00': 0,
      '01:00': 0,
    });
    let incountryOptions = ref(getCountries());
    let outcountryOptions = ref(getCountries());
    let incountryValue = ref(['AL', 'IT']);
    let outcountryValue = ref('GR');

    // FUNCTIONS
    const handleDate = (modelData) => {
      if (modelData) {
        date.value = modelData;
        dateValue.value = {
          start: modelData[0],
          end: modelData[1],
        };

        sendMessage(
          JSON.stringify({
            type: 'CBF',
            in_country: incountryValue.value,
            out_country: outcountryValue.value,
            start_date: new Date(dateValue.value.start),
            end_date: new Date(dateValue.value.end),
          }),
        );
      }
    };

    const waitForOpenConnection = () => {
      return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10;
        const intervalTime = 200;
        let currentAttempt = 0;
        const interval = setInterval(() => {
          if (this.socket.readyState === this.socket.OPEN) {
            clearInterval(interval);
            resolve();
          } else if (currentAttempt >= maxNumberOfAttempts) {
            clearInterval(interval);
            reject();
          }
          currentAttempt++;
        }, intervalTime);
      });
    };

    const sendMessage = async (message) => {
      if (socket.value.readyState === socket.value.OPEN) {
        socket.value.send(message);
      } else {
        console.log('Waiting for connection...');
        await waitForOpenConnection();
        socket.value.send(message);
      }
    };

    return {
      date,
      dateValue,
      socket,
      connectedStatus,
      message,
      chartData,
      incountryOptions,
      incountryValue,
      outcountryOptions,
      outcountryValue,
      handleDate,
      sendMessage,
      waitForOpenConnection,
    };
  },
  async mounted() {
    // All our guard clauses are handled on the page level
    this.socket = await new WebSocket(this.socketUrl);

    this.socket.onopen = () => {
      this.connectedStatus = 'Connected';
      this.sendMessage(
        JSON.stringify({
          type: 'CBF',
          in_country: this.incountryValue,
          out_country: this.outcountryValue,
          start_date: new Date(this.dateValue.start),
          end_date: new Date(this.dateValue.end),
        }),
      );
    };

    this.socket.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data);
      if (parsedMessage.type === 'CBF') {
        this.chartData = parsedMessage.data;
      } else if (parsedMessage.type === 'CBFUpdate') {
        const data = parsedMessage.data;
        const final_data = [];
        for (let i = 0; i < this.chartData.length; i++) {
          const in_map_code = this.chartData['name'];
          const out_map_code = this.chartData['name2'];
          const country_data = this.chartData[i]['data'];
          const country_data_final = country_data.map((item) => {
            let temp_key = `${in_map_code},${out_map_code},${item[0]}`;
            if (data[temp_key]) {
              delete data[temp_key];
              return [item[0], data[temp_key]];
            } else {
              return item;
            }
          });
          final_data.push({
            name: in_map_code,
            name2: out_map_code,
            data: country_data_final,
          });
        }
        for (const key in data) {
          const [map_code, map_code2, time] = key.split(',');
          const helper_index = this.incountryValue.indexOf(map_code);
          if (map_code2 === this.outcountryValue) {
            if (helper_index !== -1) {
              const timeAsDate = new Date(time);
              const filterStart = new Date(this.dateValue.start);
              const filterEnd = new Date(this.dateValue.end);
              if (timeAsDate >= filterStart && timeAsDate <= filterEnd) {
                const temp_data = [time, data[key]];
                final_data[helper_index]['data'].push(temp_data);
              }
            }
          }
        }
        this.chartData = final_data;
        // Loop through the data and see if we have new values for the current time
      } else {
        console.log('Unknown message type: ', parsedMessage.type);
      }
    };
  },
  methods: {
    changedCountries() {
      this.sendMessage(
        JSON.stringify({
          type: 'CBF',
          in_country: this.incountryValue,
          out_country: this.outcountryValue,
          start_date: new Date(this.dateValue.start),
          end_date: new Date(this.dateValue.end),
        }),
      );
    },
  },
};
</script>

<template>
  <h2>Cross Border Flow</h2>
  <div id="cbf-container" class="line-chart-container">
    <div class="line-chart-controls">
      <div class="line-chart-control">
        <h3>Country</h3>
        <Select2 v-model="incountryValue" :options="incountryOptions" :settings="{
          placeholder: 'Select incountry',
          multiple: true,
          closeOnSelect: false,
        }" :placeholder="'Select country'" @change="changedCountries($event)" @select="changedCountries($event)" />
        <Select2 v-model="outcountryValue" :options="outcountryOptions" :settings="{
          placeholder: 'Select outcountry',
          multiple: false,
          closeOnSelect: false,
        }" :placeholder="'Select country'" @change="changedCountries($event)" @select="changedCountries($event)" />
      </div>
      <div class="line-chart-control">
        <h3>Datetime range</h3>
        <Datepicker v-model="date" placeholder="Click here" range @update:modelValue="handleDate"></Datepicker>
      </div>
    </div>
    <div class="line-chart">
      <div class="line-chart-messages">
        <p>
          Currently showing data for:<br />
          <strong>{{ incountryValue.join(', ') }}</strong> to
          <strong>{{ outcountryValue }}</strong> from
          <strong>{{ dateValue.start }}</strong> to
          <strong>{{ dateValue.end }}</strong>
        </p>
      </div>
      <line-chart :data="this.chartData"></line-chart>
    </div>
  </div>
</template>

<style>
h2 {
  color: #ff3c3c;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.line-chart-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  border: 2px solid #f0f0f0;
  padding: 12px;
  background-color: #fefefe;
}

.line-chart-controls {
  width: 20%;
}

.line-chart-control {
  margin: 12px 2px;
  background-color: #efefef;
  border: 2px solid #dadada;
  border-radius: 3px;
  padding: 2px 12px 12px 12px;
}

.line-chart-control h3 {
  color: #288bff;
  margin: 0;
  font-size: 1rem;
  padding: 12px 0;
}

.line-chart {
  width: 80%;
}

.line-chart-messages {
  margin: 12px;
  text-align: center;
  font-size: 0.8rem;
  line-height: 1.5rem;
}

input:not([type]) {
  padding-left: 36px;
}
</style>