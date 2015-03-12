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


    var c = 0;
    var connection_points = {};
    function build(start_point){

        console.log(c);
        c++;

        //if( c > 2 ) return false;

        // Точки для следующего цикла рекурсии
        var next_point = [],
            next_point_index = 0;

        for( var j = 0; j < start_point.length; j++ ){

            // Ключ стартовой точки
            var start_point_key = 'x'+start_point[j].x+'_y'+start_point[j].y;

            // Заносим стартовую точку в провода
            if( !wires[start_point_key] )
                wires[start_point_key] = {
                    type: Object.keys(wires).length < 2 ? 'start' : 'wire',
                    connection: connection_points[start_point_key] ? connection_points[start_point_key] : null
                };

            // Находим доступные вокруг точки
            var avaliable_points = getAvaliablePoint(start_point[j].x, start_point[j].y);

            // если вокруг нет доступных точек
            if( avaliable_points == false ){
                // Помечаем стартовую точку как лампу. Выходим из цикла
                wires[start_point_key].type = 'l';

                break;
                return;
                // TODO: выходим из рекурсии?

            }else{

                // По умолчанию ветка одна
                var branches_num = 1;

                // Если доступно больше 1 точки - то мы можем ветвить
                if( avaliable_points.length > 1 )
                    branches_num = getBranchesNum();

                // Точки, которые мы выбрали во время текущей итеррации
                var _next_points = [];

                // Случайно выбираем точки из доступных, исходя из кол-ва веток
                for( var i = 0; i < branches_num; i++ ){

                    next_point_index++;

                    var random_point_key = getRandomPointKey(avaliable_points);
                    _next_points[i] = avaliable_points[random_point_key];

                    // TODO Добавляем стартовую точку как connection



                    // Удаляем эту точку, чтобы она не учавствовала в следующей итерации
                    delete avaliable_points[random_point_key];
                }

                // Определяем тип стартовой точки, исходя из выбранных следущих точек
                wires[start_point_key] = definePiontType({x: start_point[j].x, y: start_point[j].y}, _next_points, connection_points[start_point_key]);
            }




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
    }

    /**
     *
      * @param start_point
     * @param next_points
     * @param connection_point
     *
     * 0_-1 top
     * 0_1  bot
     * 1_0  left
     * -1_0 right
     */

    function definePiontType(start_point, next_points, connection_point){

        var position = connection_point == null ? null : (start_point.x - connection_point.x) + '_' + (start_point.y - connection_point.y);

        next_points.forEach(function(v, k){

            position += (start_point.x - v.x) + '_' + (start_point.y - v.y);
        });

        switch (position){
            case "null_0_-1":
                return start.t();
            break;

            case "null_-1_0":
                return start.r();
            break;

            case "null_0_1":
                return start.b();
            break;

            case "null_1_0":
                return start.l();
            break;

            case "0_-1_0_1":
                return wire.h();
            break;

            case "1_0_-1_0":
                return wire.w();
            break;

            case "0_-1_-1_0":
                return corner.tr();
            break;

            case "-1_0_0_1":
                return corner.rb();
            break;

            case "0_1_1_0":
                return corner.bl();
            break;

            case "1_0_0_-1":
                return corner.lt();
            break;

            case "0_1_1_0_0_-1":case "0_1_0_-1_1_0":
                return point.blt();
            break;

            case "1_0_0_-1_-1_0":case "1_0_-1_0_0_-1":
                return point.ltr();
            break;

            case "0_-1_-1_0_0_1":case "0_-1_0_1_-1_0":
                return point.trb();
            break;

            case "-1_0_0_1_1_0":case "-1_0_1_0_0_1":
                return point.rbl();
            break;
        }
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



