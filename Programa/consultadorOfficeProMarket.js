
        $(document).ready(function() {
            var productos = []; // Almacena todos los productos para la búsqueda
    
            // Función para renderizar productos filtrados
            function renderizarProductos(filtro = '') {
                var items = [];
                $("#productos").empty(); // Limpiar productos anteriores

                if (filtro !== '') { // Asegura que haya algo que buscar
                    // Divide el filtro en palabras clave individuales
                    var palabrasClave = filtro.toLowerCase().split(" ");
                    
                    $.each(productos, function(key, val) {
                        // Convierte el nombre del producto a minúsculas para la comparación
                        // Ahora la columna de Descripción (Nombre) es la B (índice 1)
                        var nombreProducto = val[1].toLowerCase();
                        // Verifica que el nombre del producto contenga todas las palabras clave
                        var coincideTodasPalabras = palabrasClave.every(function(palabra) {
                            return nombreProducto.includes(palabra);
                        });
                        
                        if (coincideTodasPalabras) {
                            // Columna A (0): Cantidad
                            // Columna B (1): Descripción (Nombre)
                            // Columna C (2): Marca
                            // Columna D (3): Precio
                            // Columna E (4): Total
                            
                            var cantidad = val[0] ? val[0].toString().trim() : "0";
                            var displayCantidad = (cantidad === "0") 
                                ? "<p class='mb-0 fw-bold text-danger'>Sin stock</p>" 
                                : "<p class='mb-0'>Cantidad: <span class='text-success fw-bold'>" + cantidad + "</span></p>";

                            items.push("<div class='col-md-4 mb-3'><div class='card'><div class='card-body'><h5 class='card-title'>" + val[1] + "</h5><p class='mb-1'>Precio: <span class='text-success fw-bold fs-5'>" + val[3] + "</span></p><p class='text-muted small mb-1'>Marca: " + val[2] + "</p>" + displayCantidad + "</div></div></div>");
                        }
                    });

                    if (items.length > 0) {
                        $("#productos").append(items.join(""));
                    } else {
                        // Muestra un mensaje si no hay productos que coincidan con la búsqueda
                        $("#productos").append("<div class='col-12'><p>No se encontraron productos que coincidan con la búsqueda.</p></div>");
                    }
                }
            }

    
            // Cargar productos desde el CSV
            // PARA CAMBIAR LA HOJA: Reemplaza la URL de abajo con el enlace CSV de tu nueva hoja de Google Sheets publicada
            $.ajax({
                url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRzsbf3UP0T14AY4OtTHKAKNAy5oo0GPd3T3TyCXuTP_RkXCAd5OFvGdKhekw4ASziwZwi4dv1fDfy/pub?output=csv',
                dataType: 'text',
            }).done(function(data) {
                var lineas = data.split(/\r\n|\n/);
                for (var i = 1; i < lineas.length; i++) {
                    // Usamos regex para separar por comas pero ignorar las que están dentro de comillas (para descripciones con comas)
                    var datos = lineas[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    
                    // Limpiamos las comillas que envuelven los textos traídos de CSV
                    datos = datos.map(function(d) {
                         return d.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
                    });

                    if (datos.length > 1) {
                        productos.push(datos);
                    }
                }
                renderizarProductos(); // Renderizar todos los productos inicialmente
            });
    
            // Evento de búsqueda
            $("#buscador").on('input', function() {
                var textoBusqueda = $(this).val();
                renderizarProductos(textoBusqueda);
            });

            // Evento para capturar pantalla de los productos
            $("#btnCaptura").click(function() {
                // Verificamos si hay productos visibles
                if ($("#productos").children().length === 0 || $("#productos").text().includes("No se encontraron")) {
                    alert("No hay productos para capturar.");
                    return;
                }

                var btn = $(this);
                var textoOriginal = btn.html();
                btn.html("⏳ ...");
                btn.prop("disabled", true);

                // Capturamos el contenedor de productos
                html2canvas(document.getElementById("productos"), {
                    backgroundColor: "#f5f5f5ff", // Mismo color de fondo del body
                    scale: 2 // Mayor calidad
                }).then(function(canvas) {
                    var link = document.createElement('a');
                    link.download = 'OfficeProMarket-Busqueda.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    btn.html(textoOriginal);
                    btn.prop("disabled", false);
                }).catch(function(err) {
                    console.error("Error al capturar:", err);
                    alert("Hubo un error al intentar capturar la imagen.");
                    btn.html(textoOriginal);
                    btn.prop("disabled", false);
                });
            });
        });
    