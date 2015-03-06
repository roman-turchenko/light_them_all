/**
 * Created by roman.turchenko on 05.03.15.
 */
console.log("Start!");
/**
 * Field 400x400px
 * Ceil  40x40px
 */

$(document).ready(function(){

    $('.c, .p, .w').click(function(){

        var rotation = 1*this.dataset.rotation+90;

        if( rotation >= 360 ){
            rotation = 0;
        }

        this.style.transform = 'rotate('+rotation+'deg)';
        this.dataset.rotation = rotation;

        console.log(this.className+': '+this.dataset.rotation);
    });


    // settings
    var size_x = 10,
        size_y = 10,
        ceil_x = 40,
        ceil_y = 40;

    // generate the field
    var field = $(".field"),
        x = 0, y = 10;

    field.width(ceil_x * size_x);
    field.height(ceil_y * size_y);

    for( i = 0; i<(size_x*size_y); i++ ){


        if( ++x == 11 ){
            x = 1, y--;
        }
        if( y == 11 ) y = 1;

        field.append('<div class="ceil" data-x="'+x+'" data-y="'+y+'"></div>');
    }

    // find the random start point
    var start_point = {
        x: Math.round(Math.random()*size_x),
        y: Math.round(Math.random()*size_y),
    }
                                                                                                                        console.log("Start point:");
                                                                                                                        console.log(start_point);
    /**
     * Directions:
     *  1 - top
     *  2 - right
     *  3 - bottom
     *  4 - left
     *
     * Branches: 1 or 2
     */

    var tree = {},
        green_points = [];

    /**
     * TODO: Recursive function
     * Params:
     * [x,y] - coordinates of start points (array)
     * point_type
     * green_points - array of the next avaliable points
     */

    while(true){

        var direction = getRandomInt(1, 4),
            branches  = getRandomInt(1, 2);

        console.log("Direction: "+direction);
        console.log("Branches: "+branches);



        if( tree.length == 0 || tree.length == undefined ){

            tree[start_point.x+''+start_point.y] = wire.h();
            green_points = {x: start_point.x+1, y: start_point.y+1};

        }else{

            for( var i = 0; i < green_points.length; i++ ){

            }

            switch( direction ){

                case 1: // top
                    break;

                case 2: // right
                    break;

                case 3: // bottom
                    break;

                case 4: // left

                    break;
            }
        }

        console.log('Tree:');
        console.log(tree);



        break;
    }
});

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getGreenPoints( x, y ){

}

function getNext(){

}



