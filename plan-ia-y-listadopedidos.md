Este es el LISTADO DE PEDIDOS DEL DIA que sale apartir del concentrado,
los campos ya contienen datos de la minuta que aunque no aparezcan en el
concentrado, estos datos existen y están unidos entre si. Gracias a esto
podemos crear este documento:

![](media/image1.emf)

Estos datos se componen de "RUTA" , "COLOR" + "NUMERO DE CARRITO" ¿como
se obtiene esta info?

Para crear esta lista, se crea apartir del concentrado, basicamente
vamos a enlistar todas las rutas que tenemos de nuestro concentrado, de
cada ruta vamos a anotar en esta lista el COLOR que esta asignado a esta
RUTA, y en el concentrado el NUMERO DE CARRITO se le asigna al
REPARTIDOR, cada REPARTIDOR lleva una ruta entonces esa ruta lleva un
REPARTIDOR y ese REPARTIDOR lleva un NUMERO DE CARRITO, ese dato es el
que se va a anotar al lado del COLOR ASIGNADO A LA RUTA QUE ESTAMOS
ANOTANDO en esta lista. Vamos a usar el formato que estamos viendo en
este doc o sea digamos que cada 8 columnas vamos a separar la lista por
bloques o algo así para que la lista no quede tan amontonada.

![A stack of boxes with labels AI-generated content may be
incorrect.](media/image2.png){width="3.807179571303587in"
height="5.076239063867017in"}Estas son las etiquetas que se usan para
detectar en que color pertenecen estos paquetes que tienen esas rutas.
Las etiquetas contienen lo siguiente:

![A white label with black numbers and a barcode AI-generated content
may be incorrect.](media/image3.png){width="3.3055555555555554in"
height="2.8055555555555554in"}PEDIDO: ID DE ETIQUETA QUE SALE EN LA
BOLETA

CAJA: NO SE

TIPO: NO SE

SECCIÓN: REGIÓN

VEHICULO: N/A

SECUENCIA: N/A

DIRECCIÓN: ES LA DIRECCIÓN DE LA CONSULTORA, DATO QUE VIENE ESCRITO TAL
CUAL FUE ESCRITO EN MINUTA

CONSULTORA: NOMBRE DE CONSULTORA ESCRITO TAL CUAL EN MINUTA

FACTURACIÓN: FECHA DE FACTURACION

REPARTIDOR: ES LA RUTA PERO AQUI ELLOS LO PONEN COMO "REPARTIDOR" SOLO
QUE AQUI ES LA RUTA

CODIGO DE BARRAS + IMPRESION DE SECUENCIA DE LA CAJA.

De todos estos datos de la etiqueta solo contamos con los datos de
DIRECCIÓN, RUTA (REPARTIDOR aqui en la etiqueta solamente) Y CONSULTORA.

La app por medio de la camara tiene que detectar la DIRECCIÓN, RUTA Y
CONSULTORA, estos tres datos los va a buscar en la BDD, se puede basar
de la RUTA pero gracias al nombre de CONSULTORA va a checar que esa
CONSULTORA si contenga esa RUTA y esa DIRECCIÓN, va a checar que si sean
datos que están ligados correctamente, ya que lo confirma lo checa ahora
en el concentrado y el concentrado lo dirige al LISTADO DE PEDIDOS DE
HOY porque ahi le va a dar el dato de RUTA, COLOR + NUMERO DE CARRITO.

Ya que ese dato lo tenga confirmado, la app va a colorear toda la
pantalla del color que fue asignado, le va a poner grande la RUTA,
COLOR + NUMERO DE CARRITO, y con audio le va a dictar todo eso por
ejemplo:

**RUTA: M14**

**COLOR: AZUL**

**NUMERO: 8**

Y el audio dice: RUTA M14 COLOR AZUL NUMERO 8

Tiene que decirlo rápido, no tan rapido, y debe de ser ENTENDIBLE, todo
esto como en 5 segundos y ya que termine el audio va a salir un botón de
"ACEPTAR" abajo del texto y al dar click le aparece la camara otra vez.
Esto pasa cuando pasas la camara y en automatico detecta los datos y en
automatico te sale la pantalla. La idea es que eso se mande a una
pantalla aparte del cel, un monitor donde se muestre eso.

Entonces lo importante de la etiqueta es que la camara sepa identificar
DIRECCION, CONSULTORA Y REPARTIDOR, y que los busque rapidisimo en la
BDD. Es necesario que el tiempo de respuesta sea de 0.2 segundos o algo
asi, menos de 0.9 segundos. La rápidez es importante aqui porque el
tiempo es oro para ellos y no tienen tiempo de esperar a que la app
cargue por 5 horas o algo así hasta que les de la información.

Fase 1:

Crear listado de pedidos.

Fase 2:

Camara que detecte los datos del listado en la etiqueta, identificar los
datos de la etiqueta.

DIRECCION

RUTA

CONSULTORA
