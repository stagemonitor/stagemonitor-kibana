# stagemonitor-kibana

This incubating plug-in for Kibana allows you to visualize distributed traces from spans collected by stagemonitor.

It looks like this:

![Screenshot stagemonitor kibana plugin](https://user-images.githubusercontent.com/4292951/28668633-1e70e806-72d1-11e7-93e6-601edf99d242.png)


# Installation

Just run the following command from your Kibana installation root:

    ./bin/kibana-plugin install https://github.com/stagemonitor/stagemonitor-kibana/archive/TODO


# Development

Start elasticsearch on your machine and run the following commands

    git clone https://github.com/elastic/kibana
    git checkout tags/v5.5.0
    npm install
    cd plugins
    git clone git@github.com:stagemonitor/stagemonitor-kibana.git
    npm install
    cd ..
    npm start

Access Kibana under https://localhost:5601 -> the lazy optimizations may take some minutes for the initial pageload.
