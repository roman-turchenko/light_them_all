/**
 * Created by roman.turchenko on 05.03.15.
 */
console.log("Start!");
/**
 * Field 400x400px
 * Ceil  40x40px
 */

// settings
var size_x = 10,
    size_y = 10,
    ceil_x = 40,
    ceil_y = 40;



var wires      = {},
    emptines   = {},
    diagonales = {};

$(document).ready(function(){

    $('.c, .p, .w').click(function(){

        var rotation = 1*this.dataset.rotation+90;

        if( rotation >= 360 ){
            rotation = 0;
        }

        this.style.webkitTransform = 'rotate('+rotation+'deg)';
        this.dataset.rotation = rotation;

        console.log(this.className+': '+this.dataset.rotation);
    });


    // generate the field
    var field = $(".field"),
        x = 0, y = size_y;

    field.width(ceil_x * size_x);
    field.height(ceil_y * size_y);

    for( i = 0; i<(size_x*size_y); i++ ){


        if( ++x == size_x+1 ){
            x = 1, y--;
        }
        if( y == size_y+1 ) y = 1;

        field.append('<div class="ceil" id="x'+x+'_y'+y+'" data-x="'+x+'" data-y="'+y+'"></div>');
    }

    /**
     * Directions:
     *  1 - top
     *  2 - right
     *  3 - bottom
     *  4 - left
     *
     * Branches: 1 or 2
     */
    // find the random start point
    var start_point = {
        x: getRandomInt(size_x - (size_x - 4), size_x-4),
        y: getRandomInt(size_y - (size_y - 4), size_y-4),
    }


    var c = 0
    function build(start_point){

        console.log(c);
        c++;

        //if( c > 2 ) return false;

        for( var j = 0; j < start_point.length; j++ ){

            // Заносим стартовую точку в провода
            if( !wires['x'+start_point[j].x+'_y'+start_point[j].y] )
                wires['x'+start_point[j].x+'_y'+start_point[j].y] = {type: Object.keys(wires).length < 2 ? 'start' : 'wire'};

            // Находим доступные вокруг точки
            var avaliable_points = getAvaliablePoint(start_point[j].x, start_point[j].y);

            // находим точки по диагонали от стартовой
            var diagonal_points = getDiagonalPionts(start_point[j].x, start_point[j].y);
            // заносим точки по диагонали в пустоту
            diagonal_points.forEach(function(v,k){

                var key = 'x'+ v.x+'_y'+ v.y;

                if( !emptines[key] )
                    emptines[key] = true;

                // заносим точки по диагонали в специаяльный массив
                diagonales[key]= true;
            });

            // если вокруг нет доступных точек
            if( avaliable_points == false ){
                // Помечаем стартовую точку как лампу. Выходим из цикла
                wires['x'+start_point[j].x+'_y'+start_point[j].y].type = 'lamp';

                break;
                return;
                // TODO: выходим из рекурсии?

            }else{
                // Заносим все доступные точки в пустоту
                avaliable_points.forEach(function(v,k){
                    if( !emptines['x'+ v.x+'_y'+ v.y] )
                        emptines['x'+ v.x+'_y'+ v.y] = true;
                });

                // Определяем, сколько веток у нас будет
                var branches_num = getBranchesNum();
                // определяем следующие точки как массив
                var next_point = [];

                // Определяем следующую клетку для каждой ветки
                for( var i = 0; i < branches_num; i++ ){

                    console.log(i + ' avaliable_points');
                    console.log(avaliable_points);

                    var random_point_key = getRandomPointKey(avaliable_points);

                    if( avaliable_points[random_point_key] ){
                        next_point[i] = avaliable_points[random_point_key];

                        // удаляем точку из доступных
                        avaliable_points.splice(random_point_key,1);
                        var key = 'x'+next_point[i].x+'_y'+ next_point[i].y;

                        // Удаляем найденую клетку из пустот
                        delete emptines[key];
                    }
                }
            }
        }

        if( next_point )
            build(next_point);

/*
            //if( avaliable_points !== false ){


                // объединяем доступные точки и диагональные точки
                var all_points = avaliable_points.concat(diagonal_points);

                console.log('all_points');
                console.log(all_points);

                // Заносим все доступные точки в пустоту
                all_points.forEach(function(v,k){
                    emptines['x'+v.x+'_y'+ v.y] = true;
                });

                // Определяем, сколько веток у нас будет
                var branches_num = getBranchesNum();

                // определяем следующие точки как массив
                var next_point = [];

                // Определяем следующую клетку для каждой ветки
                for( var i = 0; i < branches_num; i++ ){

                    next_point[i] = getRandomPoint(avaliable_points);
                    var key = 'x'+next_point[i].x+'_y'+ next_point[i].y;

                    // Добавляем найденую клетку в провода
                    wires[key] = {type: 'battery'};
                    // Удаляем найденую клетку из пустот
                    delete emptines[key];
                }

                build(next_point);
*/
           /* }else{
                wires['x'+start_point[j].x+'_y'+start_point[j].y] = {type: 'lamp'};
                var diagonal_points = getDiagonalPionts(start_point[j].x, start_point[j].y);
                // Заносим все доступные точки в пустоту
                diagonal_points.forEach(function(v,k){
                    emptines['x'+v.x+'_y'+ v.y] = true;
                    delete wires['x'+v.x+'_y'+ v.y];
            //    });
            //    return;
            /*/
    }

    /**
     * Получить массив доступных точек
     * @param x
     * @param y
     * @returns {*}
     */
    function getAvaliablePoint( x, y ){

        var result = filtred_result = [];

        // если точки угловые
        if( (x == 1 || x == size_x) && (y == 1 || y == size_y) ){

            result = [
                {x: x, y: ( y == 1 ? y + 1: y - 1)},
                {x: ( x == 1 ? x + 1: x - 1), y: y},
            ];

        }else if( y == 1 ){// точка на нижнем ребре
            result = [
                {x: x + 1, y: y},
                {x: x - 1, y: y},
                {x: x,     y: y + 1}
            ];

        }else if( x == 1 ){// точка на левом ребре
            result = [
                {x: x,     y: y + 1},
                {x: x,     y: y - 1},
                {x: x + 1, y: y}
            ];

        }else if( x == size_x ){// точка на правом ребре
            result = [
                {x: x,     y: y + 1},
                {x: x,     y: y - 1},
                {x: x - 1, y: y}
            ];
        }else if( y == size_y ){// точка на верхней грани
            result = [
                {x: x + 1, y: y},
                {x: x - 1, y: y},
                {x: x,     y: y - 1}
            ];

        }else{ //точка где-то в центре

            result = [
                {x: x - 1, y: y},     // слева
                {x: x,     y: y + 1}, // сверху
                {x: x + 1, y: y},     // справа
                {x: x,     y: y - 1}
            ];
        }

        /**
         * Проверяем полученные точки
         * Берем только те, которых нет в проводах и пустотах
         */
        var i = 0; while( i < result.length ){

            var key = 'x'+result[i].x+'_y'+result[i].y;

            /**
             * TODO:
             * Диагонали стартовой точки блокируют возможные варианты для следующей точки
             * Нужно это обойти
             */
            if( diagonales[key] ){
                //delete emptines[key];
                //delete diagonales[key];
            }


            if( (!wires[key] && !emptines[key]) ){
                filtred_result.push(result[i]);
            } i++;
        }

        return filtred_result.length ? filtred_result : false;
    }

    function getDiagonalPionts(x, y){
        var result = [],
            sorted = [];

        // Левый нижний
        if ( x - 1 > 0 && y - 1 > 0 )
            result.push({x: x - 1, y: y - 1});

        // Левый верхний
        if( x - 1 > 0 && y + 1 <= size_y  )
            result.push({x: x - 1, y: y + 1});

        // Правый верхний
        if( x + 1 <= size_x && y + 1 <= size_y )
            result.push({x: x + 1, y: y + 1});

        // правый нижний
        if( x + 1 <= size_x && y - 1 > 0 )
            result.push({x: x + 1, y: y - 1});

        // Проверяем, что бы диагональные точки не были частью пустоты или проводов
        for( var i = 0; i < result.length; i++  ){

            var key = 'x'+result[i].x+'_y'+result[i].y;
            if( !wires[key] || !emptines[key] ){
                sorted.push({x: result[i].x, y: result[i].y});
            }
        }

        return result;
    }


    function getRandomPoint( points_array ){
        return points_array[getRandomPointKey(points_array)];
    }

    function getRandomPointKey( points_array ){
        return getRandomInt(0, points_array.length-1)
    }


// ---- Start ------
    build([start_point]);

    if( Object.keys(wires).length > 0 ){
        Object.keys(wires).forEach(function(v, k){

            var element = $(document.getElementById(v));
            var type = wires[v].type;

            setTimeout(function(){element.addClass(type);}, 100*k);
        });
    }
// ------------------

});

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBranchesNum(){
    var data = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    return data[getRandomInt(0, data.length - 1)];
}



