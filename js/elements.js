/**
 * Created by roman.turchenko on 06.03.15.
 */
var wire = {

    get: function(deg){
        return {type: 'w', rotation: deg};
    },

    h: function(){
        return this.get(0);
    },

    v: function(){
        return this.get(90);
    }
}

var point = {
    get: function(deg){
        return {type: 'p', rotation: deg};
    },

    // bottom-left-top
    blt: function(){
        return this.get(0);
    },

    ltr: function(){
        return this.get(90);
    },

    trb: function(){
        return this.get(180);
    }
}

var corner = {
    get: function(deg){
        return {type: 'c', rotation: deg};
    },

    lt: function(){
        return this.get(0);
    },

    tr: function(){
        return this.get(90);
    },

    rb: function(){
        return this.get(180);
    },

    bl: function(){
        return this.get(270);
    }
}