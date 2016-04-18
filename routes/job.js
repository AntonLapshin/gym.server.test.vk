function getDeadline(e){return DateHelper.addSeconds(new Date(e),TIMER+MAX_DELAY)}var Db=require("../db"),DateHelper=require("../controllers/date"),$=require("jquery-deferred"),PERIOD=60,TIMER=60,WEIGHT_MIN=20,WEIGHT_MAX=60,WEIGHT_DELTA=2.5,MAX_DELAY=3,MONEY_MIN=3,MONEY_MAX=6;module.exports={getExpectTime:function(e){var r=new Date,t=new Date(e["private"].job.nextTime);return(t-r)/1e3},isStartedAlready:function(e){if(!e["private"].job.time)return!1;var r=new Date;return r<=getDeadline(new Date(e["private"].job.time))},get:{handler:function(e){var r=e.player,t=new Date,a=r["private"].job,i=$.Deferred();if(module.exports.isStartedAlready(r))return i.reject("MES_STARTEDALREADY"),i;var E=module.exports.getExpectTime(r);return E>0?(i.resolve({success:!1,time:E}),i):(a.weight=(Math.floor(Math.random()*(WEIGHT_MAX-WEIGHT_MIN+1))+WEIGHT_MIN)*WEIGHT_DELTA,a.time=t.getTime(),a.nextTime=DateHelper.setNextTime(t,PERIOD).getTime(),e.isDirty=!0,i.resolve({success:!0,weight:a.weight}),i)}},complete:{handler:function(e){var r=e.player,t=r["private"].job,a=$.Deferred();if(!t.time)return a.reject("MES_NOTSTARTED"),a;var i=getDeadline(new Date(t.time));if(t.weight=null,t.time=null,new Date>=i)return a.reject("MES_TIMEISUP"),a;var E=$.random(MONEY_MIN,MONEY_MAX);r["private"].money+=E,e.isDirty=!0;var n={success:!0,job:"success",money:E};return Math.random()<.1&&(r["private"].gold++,n.gold=1),a.resolve(n),a}},PERIOD:PERIOD,TIMER:TIMER,MONEY_MIN:MONEY_MIN,MONEY_MAX:MONEY_MAX,WEIGHT_MIN:WEIGHT_MIN*WEIGHT_DELTA,WEIGHT_MAX:WEIGHT_MAX*WEIGHT_DELTA};