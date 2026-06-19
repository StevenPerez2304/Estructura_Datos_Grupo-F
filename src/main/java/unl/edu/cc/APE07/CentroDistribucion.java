package unl.edu.cc.APE07;

import java.util.ArrayList;
import java.util.Random;

public class CentroDistribucion {

    private ArrayList<Paquete> inventario;
    private ColaPaquetes cola;
    private PilaPaquete pila;
    private boolean ordenarPorId = false;

    public CentroDistribucion(int capacidad) {
        inventario = new ArrayList<>(capacidad);
        cola = new ColaPaquetes(capacidad);
        pila = new PilaPaquete(capacidad);
    }

    public void recibirCajaCamion(Paquete p) {
        inventario.add(p);
        cola.enqueue(p);
        pila.push(p);
        ordenarPorId = false;
    }

    public Paquete despacharACliente() {
        if (!inventario.isEmpty()) {
            return inventario.remove(inventario.size() - 1);
        }
        return null;
    }

    public void mostrarPrimeros10EnSalir() {
        System.out.println("\n=== PRÓXIMOS 10 PAQUETES EN SALIR (LIFO) ===");
        int contador = 0;
        for (int i = inventario.size() - 1; i >= 0 && contador < 10; i--, contador++) {
            Paquete p = inventario.get(i);
            System.out.println("ID: " + p.getId() + " | Código Postal: " + p.getCodigoPostal());
        }
    }

    public void ordenarRutaQuickSort() {
        quickSort(0, inventario.size() - 1);
    }

    private void quickSort(int izquierda, int derecha) {
        int i = izquierda;
        int j = derecha;
        int pivote = inventario.get((izquierda + derecha) / 2).getCodigoPostal();

        while (i <= j) {
            while (inventario.get(i).getCodigoPostal() < pivote)
                i++;
            while (inventario.get(j).getCodigoPostal() > pivote)
                j--;
            if (i <= j) {
                Paquete temp = inventario.get(i);
                inventario.set(i, inventario.get(j));
                inventario.set(j, temp);
                i++;
                j--;
            }
        }
        if (izquierda < j)
            quickSort(izquierda, j);
        if (i < derecha)
            quickSort(i, derecha);
    }

    // ─── Nuevo: ordenamiento Burbuja sobre arreglo pequeño ───────────────────
    public void ordenarConBurbuja(int muestra) {
        int tamano = Math.min(muestra, inventario.size());
        Paquete[] arreglo = new Paquete[tamano];

        for (int i = 0; i < tamano; i++) {
            arreglo[i] = inventario.get(i);
        }

        long inicio = System.nanoTime();
        GestorRutas.ordenar(arreglo);
        long fin = System.nanoTime();
        double tiempo = (fin - inicio) / 1_000_000_000.0;

        System.out.printf("%nTiempo Burbuja (%d paquetes): %.6f segundos%n", tamano, tiempo);
        System.out.println("=== PRIMEROS 10 ORDENADOS POR BURBUJA ===");
        for (int i = 0; i < Math.min(10, tamano); i++) {
            System.out.println("ID: " + arreglo[i].getId() +
                    " | Código Postal: " + arreglo[i].getCodigoPostal());
        }
    }

    public Paquete busquedaSecuencial(int idBuscado) {
        for (Paquete p : inventario) {

            if (p.getId() == idBuscado) {
                return p;
            }
        }

        return null;
    }

    public void ordenarPorId() {
        quickSort(0, inventario.size() - 1);
        ordenarPorId = true;
    }

    private void quickSortId(int izquierda, int derecha) {

        int i = izquierda;
        int j = derecha;

        int pivote = inventario.get((izquierda + derecha) / 2)
                .getId();

        while (i <= j) {

            while (inventario.get(i).getId() < pivote) {
                i++;
            }

            while (inventario.get(j).getId() > pivote) {
                j--;
            }

            if (i <= j) {

                Paquete temp = inventario.get(i);

                inventario.set(i, inventario.get(j));
                inventario.set(j, temp);

                i++;
                j--;
            }
        }

        if (izquierda < j) {
            quickSortId(izquierda, j);
        }

        if (i < derecha) {
            quickSortId(i, derecha);
        }
    }

    public Paquete busquedaBinaria(int idBuscado) {

        if (!ordenarPorId) {
            ordenarPorId();
        }

        int izquierda = 0;
        int derecha = inventario.size() - 1;

        while (izquierda <= derecha) {

            int medio = (izquierda + derecha) / 2;

            int idActual = inventario.get(medio).getId();

            if (idActual == idBuscado) {
                return inventario.get(medio);
            }

            if (idActual < idBuscado) {
                izquierda = medio + 1;
            } else {
                derecha = medio - 1;
            }
        }

        return null;
    }

    public static void main(String[] args) {

        int cantidadPaquetes = 10000;

        CentroDistribucion centro = new CentroDistribucion(cantidadPaquetes);

        Random random = new Random();

        System.out.println(
                "Generando " +
                        cantidadPaquetes +
                        " paquetes...");

        for (int i = 0; i < cantidadPaquetes; i++) {

            int cp = random.nextInt(900000)
                    + 100000;

            centro.recibirCajaCamion(
                    new Paquete(i, cp));
        }

        System.out.println("Paquetes cargados.");

        int idBuscado = random.nextInt(cantidadPaquetes);

        System.out.println(
                "\nID buscado: " +
                        idBuscado);

        // ==========================
        // BÚSQUEDA SECUENCIAL
        // ==========================

        long inicioSec = System.nanoTime();

        Paquete resultadoSec = centro.busquedaSecuencial(idBuscado);

        long finSec = System.nanoTime();

        long tiempoSec = finSec - inicioSec;

        // ==========================
        // ORDENAMIENTO POR ID
        // ==========================

        long inicioOrden = System.nanoTime();

        centro.ordenarPorId();

        long finOrden = System.nanoTime();

        long tiempoOrden = finOrden - inicioOrden;

        // ==========================
        // BÚSQUEDA BINARIA
        // ==========================

        long inicioBin = System.nanoTime();

        Paquete resultadoBin = centro.busquedaBinaria(idBuscado);

        long finBin = System.nanoTime();

        long tiempoBin = finBin - inicioBin;

        System.out.println(
                "\n===== RESULTADOS =====");

        System.out.println(
                "Busqueda Secuencial: "
                        + tiempoSec +
                        " ns");

        System.out.println(
                "Ordenamiento por ID: "
                        + tiempoOrden +
                        " ns");

        System.out.println(
                "Busqueda Binaria: "
                        + tiempoBin +
                        " ns");

        System.out.println(
                "Ordenamiento + Binaria: "
                        + (tiempoOrden + tiempoBin)
                        + " ns");

        if (resultadoSec != null) {
            System.out.println(
                    "\nSecuencial encontro ID: "
                            + resultadoSec.getId());
        }

        if (resultadoBin != null) {
            System.out.println(
                    "Binaria encontró ID: "
                            + resultadoBin.getId());
        }
    }
}