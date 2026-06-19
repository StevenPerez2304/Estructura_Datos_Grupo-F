package unl.edu.cc.APE07;

public class GestorRutas {
    public static void ordenar(Paquete[] datos) {
        //TODO: Implementar inicialmente un metodo de ordenamiento Burbuja
        int n = datos.length;
        boolean huboIntercambio;

        for (int i = 0; i < n - 1; i++) {

            huboIntercambio = false;

            for (int j = 0; j < n - 1 - i; j++) {

                if (datos[j].getCodigoPostal() > datos[j + 1].getCodigoPostal()) {

                    // Intercambio
                    Paquete temp = datos[j];
                    datos[j] = datos[j + 1];
                    datos[j + 1] = temp;

                    huboIntercambio = true;
                }
            }

            // Si no hubo intercambios, el arreglo ya está ordenado
            if (!huboIntercambio) break;
        }
    }
}
