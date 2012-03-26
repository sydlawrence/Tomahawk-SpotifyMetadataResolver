var SpotifyMetadataResolver = Tomahawk.extend(TomahawkResolver, {

	getConfigUi: function () {
		var uiData = Tomahawk.readBase64("config.ui");
		return {
			"widget": uiData,
			fields: [{
				name: "includeCovers",
				widget: "covers",
				property: "checked"
			}, {
				name: "includeRemixes",
				widget: "remixes",
				property: "checked"
			}, {
				name: "includeLive",
				widget: "live",
				property: "checked"
			}],
			images: [{
				"spotifymetadata.png" : Tomahawk.readBase64("spotifymetadata.png")
			}]
		};
	},

	newConfigSaved: function () {
		var userConfig = this.getUserConfig();
		if((userConfig.includeCovers != this.includeCovers) || (userConfig.includeRemixes != this.includeRemixes) || (userConfig.includeLive != this.includeLive)) {
			this.includeCovers = userConfig.includeCovers;
			this.includeRemixes = userConfig.includeRemixes;
			this.includeLive = userConfig.includeLive;
		}
	},

	settings: {
		name: 'Spotify',
		weight: 85,
		timeout: 15
	},

	init: function() {
		String.prototype.capitalize = function(){
		return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
		};
	},	

	getTrack: function (trackTitle, origTitle) {
		if ((this.includeCovers === false || this.includeCovers === undefined) && trackTitle.search(/cover/i) !== -1 && origTitle.search(/cover/i) === -1){
			return null;
		}
		if ((this.includeRemixes === false || this.includeRemixes === undefined) && trackTitle.search(/remix/i) !== -1 && origTitle.search(/remix/i) === -1){
			return null;
		}
		if ((this.includeLive === false || this.includeLive === undefined) && trackTitle.search(/live/i) !== -1 && origTitle.search(/live/i) === -1){
			return null;
		}
		else {
			return trackTitle;
		}
	},

	resolve: function(qid, artist, album, title)
	{
		if (artist !== "") {
			query = encodeURIComponent(artist) + "+";
		}
		if (title !== "") {
			query += encodeURIComponent(title);
		}
		var apiQuery = "http://ws.spotify.com/search/1/track.json?q=" + query;
		var that = this;
		var empty = {
			results: [],
			qid: qid
		};
		Tomahawk.asyncRequest(apiQuery, function(xhr) {
			var resp = JSON.parse(xhr.responseText);
			//console.log(resp);

			resp = resp.tracks;
			if (resp.length !== 0){
				var results = [];
				for (i = 0; i < resp.length; i++) {
					// Need some more validation here
					// This doesnt help it seems, or it just throws the error anyhow, and skips?
					if(resp[i] === undefined){
						continue;
					}
				
					var result = {
						artist:resp[i].artists[0].name,
						album:resp[i].album.name,
						url:resp[i].href,
						track:resp[i].name,
						play:false,
					};

					result.spotifyURI = true;
					results.push(result);
				}
				var return1 = {
					qid: qid,
					results: [results[0]]
				};
				Tomahawk.addTrackResults(return1);
			}
			else {
				Tomahawk.addTrackResults(empty);
			}
		});
	}

});

Tomahawk.resolver.instance = SpotifyMetadataResolver;