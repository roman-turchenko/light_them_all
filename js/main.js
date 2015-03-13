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
    var cords = {};

    function build(start_point){

        console.log(c);
        c++;

        //if( c > 2 ) return false;

        // Точки для следующего цикла рекурсии
        var next_point = [],
            next_point_index = -1;

        for( var j = 0; j < start_point.length; j++ ){

            // Ключ стартовой точки
            var start_point_key = 'x'+start_point[j].x+'_y'+start_point[j].y;

            // Массив с координатами
            cords[start_point_key] = start_point[j];

            // Заносим стартовую точку в провода
            if( !wires[start_point_key] ){

                // Если точка является началом, то у нее нет никакого коннекшена
                if( Object.keys(wires).length == 0 )
                    connection_points[start_point_key] = null;

                wires[start_point_key] = {
                    type: Object.keys(wires).length == 0 ? 'start' : 'wire',
                    connection: connection_points[start_point_key] ? connection_points[start_point_key] : null,
                    rotation: 0,
                };
            }

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

//                if(c > 100) return;

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
                        _next_points[i]  = avaliable_points[random_point_key];

                    // TODO записать _next_points в next_point
                    next_point[next_point_index] = _next_points[i];

                    // TODO Добавляем стартовую точку как connection
                    connection_points['x'+avaliable_points[random_point_key].x+'_y'+avaliable_points[random_point_key].y] = start_point_key;

                    // Удаляем найденую новую точку, чтобы она не учавствовала в следующей итерации
                    delete avaliable_points[random_point_key];
                }

                // Определяем тип стартовой точки, исходя из выбранных следущих точек
                var point_type = definePiontType({x: start_point[j].x, y: start_point[j].y}, _next_points, cords[connection_points[start_point_key]] || null);
                wires[start_point_key].type = point_type.type;
                wires[start_point_key].rotation = point_type.rotation;
            }
        }

        if( next_point.length > 0 )
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

        if( connection_point == null && next_points.length == 2 ){
            connection_point = next_points[0];
            next_points.splice(0,1);
        }


        var position = connection_point == null ? null : (start_point.x - connection_point.x) + '_' + (start_point.y - connection_point.y);

        next_points.forEach(function(v, k){

            position += '_' + (start_point.x - v.x) + '_' + (start_point.y - v.y);
        });

        // TODO Переписать все что ниже. Не все комбинации попадают в кейсы. Сделать универсальное решение

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

            case "0_-1_0_1":case "0_1_0_-1":
                return wire.v();
            break;

            case "1_0_-1_0":case "-1_0_1_0":
                return wire.h();
            break;

            case "0_-1_-1_0":case "-1_0_0_-1":
                return corner.tr();
            break;

            case "-1_0_0_1":case "0_1_-1_0":
                return corner.rb();
            break;

            case "0_1_1_0":case "1_0_0_1":
                return corner.bl();
            break;

            case "1_0_0_-1":case "0_-1_1_0":
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

            case "-1_0_0_1_1_0":case "-1_0_1_0_0_1":case "1_0_0_1_-1_0":
                return point.rbl();
            break;

            default :
                return {type: 'unknown', rotation: 0};
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
            var rotation = wires[v].rotation;
            var classic = document.getElementById(v);

            setTimeout(function(){
                element.addClass(type);
                classic.style.webkitTransform = 'rotate('+rotation+'deg)';
                classic.dataset.rotation = rotation;
            }, 100*k);
        });
    }
// ------------------

});

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBranchesNum(){
    var data = [1,1,1,1,1,2,2,2,2,2];
//    var data = [1,1,1,1,1];
    return data[getRandomInt(0, data.length - 1)];
}



