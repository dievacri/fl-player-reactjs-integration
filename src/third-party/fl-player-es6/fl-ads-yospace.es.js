/*! ******************************************************************************* 
   Package Name: fl-ads-yospace
   Generated: 2022-08-24
   Version: 7.0.56

   Copyright (C) Firstlight Media. All rights reserved.  
   
   All information contained herein is, and remains the property of Firstlight Media. 
   The intellectual and technical concepts contained herein are proprietary to 
   Firstlight Media.  

   Dissemination of this information or reproduction of this material is strictly 
   forbidden unless prior written permission is obtained from Firstlight Media.  
   ******************************************************************************* */
import{createLogger as e,LoggerLevel as t,UtilFactory as s,createError as i,ErrorCodes as a,createEventEmitter as r}from"./fl-foundation.es";import{PlaybackAutoSeekMode as n,PlaybackFastForwardMode as o,PlaybackRewindMode as l,PlaybackRepeatedMode as h,PlaybackInterruptedMode as c,MetadataInformation as d,FrameType as g,AdContentTimePosition as u,PlayerContext as y,AdTrackingEvent as p,VALUE_UNKNOWN as S,AdEvent as A,PLAYBACK_STATES as E,SEEKING_STATES as T,BUFFERING_STATES as P}from"./fl-player-interface.es";var k,v;!function(e){e[e.PLAYER_READY_WITH_SESSION_MONITOR=0]="PLAYER_READY_WITH_SESSION_MONITOR",e[e.PLAYER_READY_NO_SESSION=1]="PLAYER_READY_NO_SESSION",e[e.SESSION_ACTIVE_WITH_ANALYTICS=2]="SESSION_ACTIVE_WITH_ANALYTICS",e[e.SESSION_ACTIVE_NO_ANALYTICS=3]="SESSION_ACTIVE_NO_ANALYTICS",e[e.SESSION_INACTIVE=4]="SESSION_INACTIVE"}(k||(k={})),function(e){e[e.Live=0]="Live",e[e.LiveRestart=1]="LiveRestart",e[e.LiveCatchup=2]="LiveCatchup",e[e.Vod=3]="Vod"}(v||(v={}));class D{static setLogger(e){D.logger=e}static debug(e){D.logger.debug(e)}static error(e){D.logger.error(e)}static info(e){D.logger.info(e)}static trace(e){D.logger.log(e)}static warn(e){D.logger.warn(e)}}const I=Object.freeze({SESSION_INIT_FAILURE:1281});class b{constructor(s,i,a){this.yospaceSDK=i,this.adPlaybackPolicy=s,this.playbackMode=null,this.internalPlayer=void 0,this.logger=a||e(t.OFF,"FL_YOSPACE_PLAYBACK_POLICY")}setPlaybackMode(e){this.playbackMode=e}setPlayer(e){this.internalPlayer=e}canChangeVolume(){return!0}canClickThrough(){return!0}canPause(){return this.playbackMode!==this.yospaceSDK.PlaybackMode.LIVE}canResize(){return!0}canResizeCreative(){return!0}canSkip(e,t,s){if(this.playbackMode!==this.yospaceSDK.PlaybackMode.LIVE)return-1;{const s=this.isInAdvert(e,t);if(!s)return-1;let i=s.getSkipOffset();return-1===i?-1:(s.isActive()?i>=0&&(i=Math.max(0,s.getStart()+i-e)):i=0,i)}}canStop(){return!0}closestActiveBreakPriorTo(e,t){let s=null;for(let i=0;i<t.length;++i){const a=t[i];a.getStart()+a.getDuration()<e&&a.isActive()&&(s=a)}return s}didSeek(e,t,s){this.logger.log(`[AD POLICY] Did seek from ${e} to ${t}`,s)}isInAdvert(e,t){for(let s=0;s<t.length;++s){const i=t[s];if(i.getStart()<=e&&e<i.getStart()+i.getDuration())for(let t=0;t<i.getAdverts.length;++t){const s=i.getAdverts()[t];if(s.getStart()<=e&&e<s.getStart()+s.getDuration())return s}}return null}didSkip(e,t,s){this.logger.log(`[AD POLICY] Did skip from ${e} to ${t}`,s)}setInactiveAllAdBreaksBetween(e,t,s){for(let i=0;i<s.length;++i){const a=s[i];a.isActive()&&a.getStart()>=e&&a.getStart()+a.getDuration()<=t&&a.setInactive()}}willSeekTo(e,t){return this.playbackMode===this.yospaceSDK.PlaybackMode.LIVE||this.internalPlayer&&this.internalPlayer.currentTime?e:this.initialSeekPosition(e,t)}evaluateSeek(e){if(this.internalPlayer){if(this.adBreakQueueToPlay&&this.adBreakQueueToPlay.length){const t=this.adBreakQueueToPlay[0].getStart();return this.adBreakQueueToPlay.splice(0,1),void this.internalPlayer.seek(this.getPlayheadPositionWithoutAds(t,e))}this.destinationPlayhead&&(this.internalPlayer.seek(this.getPlayheadPositionWithoutAds(this.destinationPlayhead,e)/1e3),this.destinationPlayhead=void 0)}}initialSeekPosition(e,t){if(!t.length)return e;const s=this.getAdBreaks(0,e,t);if(!s.length)return e;const i=s.filter((e=>"midroll"===e.getPosition()));switch(this.adPlaybackPolicy.autoSeekMode){case n.AUTO_SEEK_SKIP_ALL:return e;case n.AUTO_SEEK_PLAY_PREROLL:return 0===s[0].getStart()?(this.destinationPlayhead=e,s[0].getStart()):e;case n.AUTO_SEEK_PLAY_MIDROLL:return this.handleAutoSeekPlayMidroll(e,i);case n.AUTO_SEEK_PLAY_ALL:{const t=0===s[0].getStart()?s[0]:void 0;return t?(this.handleAutoSeekPlayAllOnPrerollAdBreak(i),this.destinationPlayhead=e,t.getStart()):this.handleAutoSeekPlayAllOnNoPrerollAdBreak(e,i)}}return e}handleAutoSeekPlayMidroll(e,t){switch(this.adPlaybackPolicy.fastForwardMode){case o.TRICK_FW_PLAY_FIRST:return t.length?(this.destinationPlayhead=e,t[0].getStart()):e;case o.TRICK_FW_PLAY_LAST:return t.length?(this.destinationPlayhead=e,t[t.length-1].getStart()):e;default:if(t.length){this.destinationPlayhead=e;const s=t.splice(0,1)[0];if(this.adBreakQueueToPlay=t,s)return s.getStart()}return e}}handleAutoSeekPlayAllOnPrerollAdBreak(e){switch(this.adPlaybackPolicy.fastForwardMode){case o.TRICK_FW_PLAY_FIRST:{const t=e[0];this.adBreakQueueToPlay=[t];break}case o.TRICK_FW_PLAY_LAST:{const t=e[e.length-1];this.adBreakQueueToPlay=[t];break}default:this.adBreakQueueToPlay=e}}handleAutoSeekPlayAllOnNoPrerollAdBreak(e,t){switch(this.adPlaybackPolicy.fastForwardMode){case o.TRICK_FW_PLAY_FIRST:{const s=t[0];return this.destinationPlayhead=e,s.getStart()}case o.TRICK_FW_PLAY_LAST:{const s=t[t.length-1];return this.destinationPlayhead=e,s.getStart()}default:{const s=t[0];return this.destinationPlayhead=e,t.splice(0,1),this.adBreakQueueToPlay=t,s.getStart()}}}getPlayheadPositionWithoutAds(e,t){const s=t.filter((t=>t.getStart()<e)).map((e=>e.getDuration())).reduce(((e,t)=>e+t));return e-s}getAdBreaks(e,t,s,i){const a=[];return s.forEach((s=>{(s.getDuration()>0&&i&&i.includes(s.getPosition())&&s.getStart()>=e&&s.getStart()<=t||s.getDuration()>0&&(0===s.getStart()||s.getStart()>=e&&s.getStart()<=t))&&a.push(s)})),a}}class f{constructor(r,n){this.deferred_=new s.Deferred,this.createSessionError=(e,t)=>{const s=e?i(e,t):void 0;return i(I.SESSION_INIT_FAILURE|a.ERROR_CATEGORY_MASK_THIRDPARTY,t,s)},this.yospaceSDK=r,this.logger=n||e(t.OFF,"FL_YOSPACE_SESSION"),this.sessionEventListener=this.sessionEventListener.bind(this)}initialize(e,t){if(this.deferred_=new s.Deferred,this.initializationData=e,t)this.internalAdsPlaybackPolicy=new b(t,this.yospaceSDK,this.logger);else{const e={fastForwardMode:o.TRICK_FW_PLAY_ALL,rewindMode:l.TRICK_RW_PLAY_ALL,autoSeekMode:n.AUTO_SEEK_PLAY_PREROLL,repeatMode:h.REPEAT_ALWAYS_PLAY,interruptMode:c.INTERRUPT_RESUME};this.internalAdsPlaybackPolicy=new b(e,this.yospaceSDK,this.logger)}return this.initYospaceSession(),this.deferred_.promise}shutdown(){this.internalSession&&(this.internalSession.shutdown(),this.internalSession=void 0)}initYospaceSession(){const e=new this.yospaceSDK.SessionProperties;if(e.userAgent=this.initializationData.userAgent?this.initializationData.userAgent:"FL_YOSPACE_ADS_PLAYER",e.allowCorsForAnalytics=this.initializationData.allowCorsForAnalytics,this.initializationData.timeout&&e.setRequestTimeout(this.initializationData.timeout),D.setLogger(this.logger),this.yospaceSDK.YoLog.setLogger(D),this.yospaceSDK.YoLog.setDebugFlags(this.yospaceSDK.DEBUG_ALL),this.initializationData)switch(this.initializationData.playbackMode){case v.Live:case v.LiveRestart:this.yospaceSDK.SessionLive.create(this.initializationData.contentURL,e,this.sessionEventListener);break;case v.LiveCatchup:case v.Vod:this.yospaceSDK.SessionVOD.create(this.initializationData.contentURL,e,this.sessionEventListener)}}sessionEventListener(e){switch(this.internalSession=e.getPayload(),this.internalSession.getSessionResult()){case this.yospaceSDK.SessionResult.INITIALISED:this.session instanceof this.yospaceSDK.SessionVOD?(this.internalAdsPlaybackPolicy&&this.internalSession.setPlaybackPolicyHandler(this.internalAdsPlaybackPolicy),this.logger.log(`VOD Session playback URL: ${this.session.playbackUrl}`),this.deferred_.resolve(this.session.playbackUrl)):this.session instanceof this.yospaceSDK.SessionLive&&(this.logger.info(`Live Session playback URL: ${this.session.playbackUrl}`),this.deferred_.resolve(this.session.playbackUrl));break;case this.yospaceSDK.SessionResult.NOT_INITIALISED:{const e=`Session initialization failed: ${this.yospaceSDK.SessionResult.NOT_INITIALISED}`;this.logger.warn(e);const t=this.createSessionError(this.internalSession.getResultCode(),e);this.deferred_.reject(t);break}case this.yospaceSDK.SessionResult.NO_ANALYTICS:{const e=`Session initialization failed: ${this.yospaceSDK.SessionResult.NO_ANALYTICS}`;this.logger.warn(e);const t=this.createSessionError(this.internalSession.getResultCode(),e);this.deferred_.reject(t);break}case this.yospaceSDK.SessionResult.FAILED:{const e=`Session initialization failed: ${this.yospaceSDK.SessionResult.FAILED}`;this.logger.warn(e);const t=this.createSessionError(this.internalSession.getResultCode(),e);this.deferred_.reject(t);break}}}get session(){return this.internalSession}get adsPlaybackPolicy(){return this.internalAdsPlaybackPolicy}attachPlayerToPolicyHandler(e){this.internalAdsPlaybackPolicy&&this.internalAdsPlaybackPolicy.setPlayer(e)}evaluateSeek(){this.internalAdsPlaybackPolicy&&this.internalAdsPlaybackPolicy.evaluateSeek(this.internalSession.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR))}}class _{static createYospaceAdsSession(e,t){return new f(e,t)}}var m;!function(e){e.YMID="YMID",e.YSEQ="YSEQ",e.YTYP="YTYP",e.YDUR="YDUR",e.YCSP="YCSP"}(m||(m={}));class R{constructor(e,t){this.logger=t,this.yospaceSDK=e}createTimedMetadataFromEmsgEvent(e,t){let s,i,a,r;return e.metaTags.forEach((e=>{if(this.logger.log("metaTag",e),e.schemeIdUri.toUpperCase()==="urn:yospace:a:id3:2016".toUpperCase()){const t=this.bytesToString(e.extendedAttributes);this.logger.log("emsgData",t);t.split(",").forEach((e=>{const t=e.split("=");switch(t[0]){case m.YMID:s=t[1];break;case m.YSEQ:i=t[1];break;case m.YTYP:a=t[1];break;case m.YDUR:r=t[1]}}))}})),void 0!==s&&void 0!==i&&void 0!==a&&void 0!==r?this.yospaceSDK.TimedMetadata.createFromMetadata(s,i,a,r,t):null}createTimedMetadataFromMetadataEvent(e,t){const s=e.payload;return this.logger.log("ID3 Tag Metadata",e),this.logger.log("ID3 Tag Metadata payload",e.payload),s.key===m.YMID||s.key===m.YSEQ||s.key===m.YTYP||s.key===m.YDUR?this.processID3Data(e,t):this.handleInvalidMetadata(e),null}bytesToString(e,t=0){let s="";for(let i=t;i<e.length;i++)s+=String.fromCharCode(e[i]);return s}setID3Tag(e){this.id3={startTime:e.startTime}}processID3Data(e,t){const s=e.payload;if(this.id3&&this.id3.hasOwnProperty("startTime")){if(this.id3.startTime!==e.startTime){if(void 0!==this.id3.YMID&&void 0!==this.id3.YSEQ&&void 0!==this.id3.YTYP&&void 0!==this.id3.YDUR)return this.createId3Metadata(e,t);this.logger.warn("The last ID3 tag could not be completed",e),this.setID3Tag(e)}}else this.setID3Tag(e);this.id3[s.key]=this.bytesToString(s.data,1)}createId3Metadata(e,t){const s=this.yospaceSDK.TimedMetadata.createFromMetadata(this.id3.YMID,this.id3.YSEQ,this.id3.YTYP,this.id3.YDUR,t);return this.logger.log("ID3 tag",this.id3),this.setID3Tag(e),this.id3[e.payload.key]=this.bytesToString(e.payload.data,1),s}handleInvalidMetadata(e){this.logger.warn("ID3 Tag Metadata may contain EXT-X-DATERANGE tag"),this.logger.warn("ID3 Tag Metadata are not processed properly",e)}}class L{constructor(e,t,s,i){this.queue=[],this.onSeek=()=>{this.logger.log("Flushing the timedmetadata queue"),this.queue=[]},this.onProgress=e=>{this.findCurrentEvents().forEach((t=>this.publishEvent(t,e)))},this.enqueue=e=>{this.queue.push(e)},this.dequeue=()=>this.queue.shift(),this.publishEvent=(e,t)=>{let s;if("emsg"===e.type){const i=new d([this.buildMetaTag(e)]);s=this.sessionHandler.createTimedMetadataFromEmsgEvent(i,t)}else"metadata"===e.type&&(s=this.sessionHandler.createTimedMetadataFromMetadataEvent(e,t));null!==s&&this.session.onTimedMetadata(s)},this.next=()=>this.queue[0],this.getPlayheadPosition=()=>this.player.currentTime,this.findCurrentEvents=()=>{const e=[];let t=this.next();for(;t&&t.startTime<=this.getPlayheadPosition();)e.push(this.dequeue()),t=this.next();return e},this.buildMetaTag=e=>({type:g.META_TAG_EMSG_TYPE,id:e.id,extendedAttributes:e.messageData,schemeIdUri:e.schemeIdUri}),this.player=e,this.session=t,this.yospaceSDK=s,this.sessionHandler=new R(s,i),this.logger=i}}function O(e,t){if(!e)return 0;const s=e.getAdBreaksByType(t).filter((e=>e.getAdverts().length>0));return s.map((e=>e.getDuration())).reduce(((e,t)=>e+t),0)}function N(e,t,s){return t?e+=t.getAdBreaksByType(s).filter((t=>0===t.getStart()||t.getStart()<e)).map((e=>e.getDuration())).reduce(((e,t)=>e+t),0):e}var B;!function(e){e.ADSYSTEM="AdSystem",e.ADTITLE="AdTitle",e.ADSERVINGID="AdServingId",e.CATEGORY="Category",e.DESCRIPTION="Description",e.ADVERTISER="Advertiser",e.PRICING="Pricing",e.SURVEY="Survey",e.EXPIRES="Expires"}(B||(B={}));function C(e,t,s){return{get adID(){return e.getIdentifier()||" "},get sequence(){return e.getSequence()},get adStartTimeOffsetMs(){return e.getStart()},get durationMs(){return e.getDuration()},get remainingTimeMs(){return e.getRemainingTime(1e3*t.currentTime)},get isSkippable(){return e.getSkipOffset()>-1},get skipOffsetMs(){return e.getSkipOffset()},get isFiller(){return e.isFiller()},get adBreakInfo(){return s},get vastProperties(){return e?function(e){const t=e.getLinearCreative(),s={creativeId:t?t.getCreativeIdentifier():void 0},i=e.properties;if(!i)return s;return Object.keys(i).forEach((e=>{switch(i[e].name){case B.ADSYSTEM:s.adSystem=i[e].value;break;case B.ADTITLE:s.adTitle=i[e].value;break;case B.ADSERVINGID:s.adServingId=i[e].value;break;case B.CATEGORY:s.category=i[e].value;break;case B.DESCRIPTION:s.description=i[e].value;break;case B.ADVERTISER:s.advertiser=i[e].value;break;case B.SURVEY:s.survey=i[e].value;break;case B.PRICING:s.pricing=i[e].value;break;case B.EXPIRES:s.expires=i[e].value}})),s}(e):void 0}}}function M(e){const t=e.verificationResources.filter((e=>"JavaScriptResource"===e.name)).filter((e=>e.attributes.has("apiFramework"))).filter((e=>"omid"===e.attributes.get("apiFramework")));return t.length?t[0].value:null}class Y{constructor(s,i,a,n){if(this.eventEmitter=r(),this.internalPlayerContext=y.MAIN,this.midrollAdBreakIndex=0,this.isPlaybackPaused=!1,this.isPlayerSeeking=!1,this.isPlayerBuffering=!1,this.activeAdBreakInfo=void 0,this.activeAdInfo=void 0,this.shouldReportAdProgress=!1,this.currentAdStartTime=void 0,this.currentAdEndTime=void 0,this.isAdVerificationStarted=!1,this.vodSessionAdsDuration=0,this.initialize=()=>{this.initializeBySessionType(),this.subscribeToInternalPlayerEvents(),this.session?(this.session.addAnalyticObserver({onAdvertBreakStart:e=>{this.logger.log("onAdvertBreakStart",e);const t=p.AD_BREAK_STARTED_EVENT;if(this.logger.log("trackingEvent:",t),this.internalPlayerContext=y.AD,this.eventEmitter.publish("playercontextchanged",this.internalPlayerContext),null!==e){const t=function(e){switch(e){case"preroll":return u.PREROLL;case"midroll":return u.MIDROLL;case"postroll":return u.POSTROLL;default:return u.UNKNOWN}}(e.getPosition()),s=this.session instanceof this.yospaceSDK.SessionVOD?this.getAdBreakIndex(t):S;this.activeAdBreakInfo=this.toAdBreakInfo(e,t,s,this.player)}this.logger.log("ActiveAdBreakInfo",this.activeAdBreakInfo),this.eventEmitter.publish(A.ADVERT_BREAK_START,this.activeAdBreakInfo)},onAdvertBreakEnd:()=>{this.logger.log("onAdvertBreakEnd");const e=p.AD_BREAK_ENDED_EVENT;this.logger.log("trackingEvent:",e);this.yospaceSession.evaluateSeek(),this.internalPlayerContext=y.MAIN,this.eventEmitter.publish("playercontextchanged",this.internalPlayerContext),this.eventEmitter.publish(A.ADVERT_BREAK_END,this.activeAdBreakInfo),this.activeAdBreakInfo=void 0},onAdvertStart:e=>{this.logger.log("onAdvertStart",e);const t=p.AD_STARTED_EVENT;this.logger.log("trackingEvent:",t),this.activeAdInfo=this.toAdInfo(e,this.player,this.activeAdBreakInfo),this.shouldReportAdProgress=!0,this.currentAdStartTime=e.getStart(),this.currentAdEndTime=e.getStart()+e.getDuration(),this.logger.log("ActiveAdInfo",this.activeAdInfo),this.eventEmitter.publish(A.ADVERT_START,this.activeAdInfo),this.onAdVerificationStart(e)},onAdvertEnd:()=>{this.logger.log("onAdvertEnd");const e=p.AD_ENDED_EVENT;this.logger.log("trackingEvent:",e),this.shouldReportAdProgress=!1,this.currentAdStartTime=void 0,this.currentAdEndTime=void 0,this.eventEmitter.publish(A.ADVERT_END,this.activeAdInfo),this.onAdVerificationEnd()},onAnalyticUpdate(){},onTrackingEvent:e=>{const t=this.toAdTrackingEvent(e);this.logger.log("trackingEvent:",t),this.onAdTrackingEvent(t)}}),this.session&&this.session instanceof this.yospaceSDK.SessionVOD&&(this.vodSessionAdsDuration=O(this.session,this.yospaceSDK.BreakType.LINEAR),this.logger.log(`VOD session duration ${this.vodSessionAdsDuration}`))):this.logger.warn("Session is invalid. Please ensure a valid YospaceAdsSession instance is passed via YospaceAdsPlayerFactory.createYospaceAdsPlayer")},this.initializeBySessionType=()=>{if(this.session&&this.session instanceof this.yospaceSDK.SessionLive)this.timedMetadataHandler=new L(this,this.session,this.yospaceSDK,this.logger);else if(this.session&&this.session instanceof this.yospaceSDK.SessionVOD&&(this.vodSessionAdsDuration=O(this.session,this.yospaceSDK.BreakType.LINEAR),this.player.playbackOptions&&this.player.playbackOptions.initialPlaybackTime)){let e=N(1e3*this.player.playbackOptions.initialPlaybackTime,this.session,this.yospaceSDK.BreakType.LINEAR);e=this.session.willSeekTo(e),this.logger.log("[AD POLICY] overriding initial playback time",e),this.player.setPlaybackOptions({...this.player.playbackOptions,initialPlaybackTime:e/1e3})}},this.playbackStateChanged_=e=>{switch(this.logger.log("onPlaybackStateChanged",e),e){case E.IDLE:case E.LOADING:break;case E.LOADED:{const e=this.session.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR).map((e=>e.getStart()));e&&e.length&&this.eventEmitter.publish("adcuepoints",e);break}case E.STARTED:this.isPlaybackPaused?(this.logger.log("onPlayerEvent -> PlayerEvent.RESUME with playhead position"),this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.RESUME),this.isPlaybackPaused=!1):(this.logger.log("onPlayerEvent -> PlayerEvent.START with playhead position"),this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.START));break;case E.PAUSED:this.logger.log("onPlayerEvent -> PlayerEvent.PAUSE with playhead position"),this.isPlaybackPaused=!0,this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.PAUSE);break;case E.STOPPED:this.logger.log("onPlayerEvent -> PlayerEvent.STOP with playhead position"),this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.STOP),this.releaseSession()}},this.onSeekingStateChanged_=e=>{switch(this.logger.log("onSeekingStateChanged",e),e){case T.ACTIVE:this.isPlayerSeeking=!0;break;case T.INACTIVE:this.isPlayerSeeking&&(this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.SEEK,1e3*this.player.currentTime),this.isPlayerSeeking=!1,this.timedMetadataHandler&&this.timedMetadataHandler.onSeek())}},this.onBufferingStateChanged_=e=>{switch(this.logger.log("onBufferingStateChanged",e),e){case P.ACTIVE:this.isPlayerBuffering=!0,this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.STALL);break;case P.INACTIVE:this.isPlayerBuffering&&(this.session.onPlayerEvent(this.yospaceSDK.PlayerEvent.CONTINUE),this.isPlayerBuffering=!1)}},this.onProgressUpdate_=()=>{if(this.activeAdInfo&&this.shouldReportAdProgress&&void 0!==this.currentAdStartTime&&void 0!==this.currentAdEndTime&&this.player.currentTime<=this.currentAdEndTime){const e=1e3*this.player.currentTime-this.currentAdStartTime;this.eventEmitter.publish("adprogressupdate",this.activeAdInfo,e)}this.session.onPlayheadUpdate(1e3*this.player.currentTime),this.timedMetadataHandler&&this.timedMetadataHandler.onProgress(1e3*this.player.currentTime)},this.onAborted_=()=>{this.logger.log("onAborted")},this.onContentLoaded_=()=>{const e=[];this.session.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR).forEach((t=>{if(t){const s=this.toAdContentTimePosition(t.getPosition()),i=this.session instanceof this.yospaceSDK.SessionVOD?this.getAdBreakIndex(s):S,a=this.toAdBreakInfo(t,s,i,this.player);t.getAdverts().map((t=>{const s=this.toAdInfo(t,this.player,a);e.push(s)}))}this.eventEmitter.publish("adbreaks",e)}))},this.onTracksChanged_=()=>{this.logger.log("onTracksChanged")},this.onTimedMetadata_=e=>{this.timedMetadataHandler&&this.timedMetadataHandler.enqueue(e)},this.onError_=e=>{this.activeAdBreakInfo&&this.eventEmitter.publish("aderror",e),this.releaseSession()},this.subscribeToInternalPlayerEvents=()=>{this.player.subscribe("playbackstatechanged",this.playbackStateChanged_),this.player.subscribe("seekingstatechanged",this.onSeekingStateChanged_),this.player.subscribe("bufferingstatechanged",this.onBufferingStateChanged_),this.player.subscribe("progressupdate",this.onProgressUpdate_),this.player.subscribe("aborted",this.onAborted_),this.player.subscribe("contentloaded",this.onContentLoaded_),this.player.subscribe("trackschanged",this.onTracksChanged_),this.player.subscribe("timedmetadata",this.onTimedMetadata_),this.player.subscribe("error",this.onError_)},this.unsubscribeFromInternalPlayerEvents=()=>{this.player.unsubscribe("playbackstatechanged",this.playbackStateChanged_),this.player.unsubscribe("seekingstatechanged",this.onSeekingStateChanged_),this.player.unsubscribe("bufferingstatechanged",this.onBufferingStateChanged_),this.player.unsubscribe("progressupdate",this.onProgressUpdate_),this.player.unsubscribe("aborted",this.onAborted_),this.player.unsubscribe("contentloaded",this.onContentLoaded_),this.player.unsubscribe("trackschanged",this.onTracksChanged_),this.player.unsubscribe("timedmetadata",this.onTimedMetadata_),this.player.unsubscribe("error")},this.releaseSession=()=>{this.midrollAdBreakIndex=0,this.session&&(this.session.shutdown(),this.session=void 0),this.unsubscribeFromInternalPlayerEvents()},this.toAdContentTimePosition=e=>{switch(e){case"preroll":return u.PREROLL;case"midroll":return u.MIDROLL;case"postroll":return u.POSTROLL;default:return u.UNKNOWN}},this.getAdBreakIndex=e=>{switch(e){case u.PREROLL:return 0;case u.MIDROLL:return++this.midrollAdBreakIndex;case u.POSTROLL:return-1;default:return S}},this.toAdBreakInfo=(e,t,s,i)=>function(e,t,s,i){return{get adBreakID(){return e.getIdentifier()||" "},get contentTimePosition(){return t},get adSequencePosition(){return 1},get adBreakStartTimeOffsetMs(){return e.getStart()},get remainingTimeMs(){return e.getRemainingTime(1e3*i.currentTime)},get durationMs(){return e.getDuration()},get totalAds(){return e.getAdverts().length},get adBreakIndex(){return s}}}(e,t,s,i),this.toAdInfo=(e,t,s)=>C(e,t,s),this.toAdTrackingEvent=e=>{switch(e){case"firstQuartile":return p.AD_FIRST_QUARTILE_EVENT;case"midpoint":return p.AD_MIDPOINT_EVENT;case"thirdQuartile":return p.AD_THIRD_QUARTILE_EVENT;case"pause":return p.AD_PAUSED_EVENT;case"resume":return p.AD_RESUMED_EVENT;case"mute":return p.AD_MUTED_EVENT;case"unmute":return p.AD_UNMUTED_EVENT;case"skip":return p.AD_SKIPPED_EVENT;case"playerExpand":return p.AD_PLAYER_EXPANDED_EVENT;case"playerCollapse":return p.AD_PLAYER_COLLAPSED_EVENT;case"adExpand":return p.AD_EXPANDED_EVENT;case"adCollapse":return p.AD_COLLAPSED_EVENT;default:return p.AD_UNKNOWN_EVENT}},this.onAdVerificationStart=e=>{if(this.logger.log("Open Measurement Ad verification: start"),!e.isActive())return void this.logger.log("Open Measurement Ad verification: advert is not active");if(e.isFiller())return void this.logger.log("Open Measurement Ad verification: advert is a filler");const t=[];e.getAdVerifications().forEach((e=>{const s=e.getVendor(),i=e.getParameters(),a=e.getResources(),r=[];a.forEach((e=>{const t={name:e.getName(),value:e.getValue(),attributes:e.getAttributes()};r.push(t)}));const n={verificationResources:r,verificationParameters:i,vendorKey:s};t.push(n)})),t.length&&(this.isAdVerificationStarted=!0,this.eventEmitter.publish(A.ADVERT_VERIFICATION_START,e,t))},this.logger=n||e(t.OFF,"FL_YOSPACE_PLAYER"),this.player=s,this.session=i.session,this.yospaceSession=i,this.yospaceSDK=a,this.session&&this.session instanceof this.yospaceSDK.SessionVOD){i.attachPlayerToPolicyHandler(this)}this.initialize()}get playerContext(){return this.internalPlayerContext}get availableBitrates(){return this.player.availableBitrates}get currentEpochTime(){return this.player.currentEpochTime}get currentTime(){if(this.player.isLive)return this.player.currentTime;const e=(t=1e3*this.player.currentTime,s=this.session,i=this.yospaceSDK.BreakType.LINEAR,s?function(e,t=[]){let s=t.filter((t=>t.getStart()+t.getDuration()<e)).map((e=>e.getDuration())).reduce(((e,t)=>e+t),0);return s+=t.filter((t=>function(e,t){return t.getStart()<=e&&e<t.getStart()+t.getDuration()}(e,t))).map((t=>e-t.getStart())).reduce(((e,t)=>e+t),0),s}(t,s.getAdBreaksByType(i).filter((e=>e.getAdverts().length>0))):0);var t,s,i;const a=Number(this.player.currentTime.toFixed(6))-Number((e/1e3).toFixed(6));return a<0?0:a}get duration(){if(this.player.isLive||!this.session||!this.session.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR).length)return this.player.duration;return(1e3*this.player.duration-this.vodSessionAdsDuration)/1e3}get internalPlayerName(){return this.player.internalPlayerName}get internalPlayerVersion(){return this.player.internalPlayerVersion}get isBuffering(){return this.player.isBuffering}get isLive(){return this.player.isLive}get isMute(){return this.player.isMute}get playbackOptions(){return this.player.playbackOptions}get isSeeking(){return this.player.isSeeking}get maxBitrate(){return this.player.maxBitrate}set maxBitrate(e){this.player.maxBitrate=e}get minBitrate(){return this.player.minBitrate}set minBitrate(e){this.player.minBitrate=e}get playbackRate(){return this.player.playbackRate}set playbackRate(e){this.player.playbackRate=e}get playbackStatistics(){return this.player.playbackStatistics}get playerState(){return this.player.playerState}get rawLibrary(){return this.player.rawLibrary}get rawPlayer(){return this.player.rawPlayer}get remainingTime(){return 0}abort(e){this.player.abort(e)}send(e,t,s){this.player.send(e,t,s)}currentOffsetFromLiveEdge(){return this.player.currentOffsetFromLiveEdge()}discardAdBreak(){}resize(e,t,s){}getActiveTracks(){return this.player.getActiveTracks()}getAllTracks(){return this.player.getAllTracks()}getCuePoints(){return this.session.getPlaybackMode()===this.yospaceSDK.PlaybackMode.VOD?this.session.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR).map((e=>e.getStart())):[]}load(){this.player.load()}muteOrUnmute(){this.player.muteOrUnmute&&this.player.muteOrUnmute()}pause(){this.player.pause()}play(){this.player.play()}seek(e){!this.player.isLive&&this.session&&this.session.getAdBreaksByType(this.yospaceSDK.BreakType.LINEAR).length?this.player.seek(this.session.willSeekTo(N(e>=0?1e3*e:0,this.session,this.yospaceSDK.BreakType.LINEAR))/1e3):this.player.seek(e)}seekToLiveEdge(){this.player.seekToLiveEdge()}seekableRange(){return this.player.isLive?this.player.seekableRange():{start:0,end:this.duration}}selectTrack(e){this.player.selectTrack(e)}setRequestInterceptor(e){this.player.setRequestInterceptor(e)}setResponseInterceptor(e){this.player.setResponseInterceptor(e)}getThumbnail(e){return this.player.getThumbnail(e)}skipAd(){}stop(){return this.player.stop()}accessFunctionHandler(e){this.player.accessFunctionHandler(e)}subscribe(e,t){this.eventEmitter.subscribe(e,t),this.player.subscribe(e,t)}unsubscribe(e,t){this.eventEmitter.unsubscribe(e,t),this.player.unsubscribe(e,t)}onAdVerificationEnd(){this.logger.log("Open Measurement Ad verification: end"),this.isAdVerificationStarted&&(this.isAdVerificationStarted=!1,this.eventEmitter.publish(A.ADVERT_VERIFICATION_END))}onAdTrackingEvent(e){this.logger.log(`Open Measurement Ad verification: ad event "${e}"`),this.eventEmitter.publish(A.ADVERT_TRACKING_EVENT,e)}setPlaybackOptions(e){this.player.setPlaybackOptions(e)}}class K{static createYospaceAdsPlayer(e,t,s,i){return new Y(e,t,s,i)}}const V="7.0.56";export{v as PlaybackMode,k as SessionState,K as YospaceAdsPlayerFactory,_ as YospaceAdsSessionFactory,M as findJavaScriptResourceURL,V as version};

