package unl.edu.cc.APE07;

public class ColaPaquetes {
    private Paquete[] queue;
    private int frente, fin, total;

    public ColaPaquetes(int capacidad) {
        this.queue = new Paquete[capacidad];
        this.frente = 0;
        this.fin = 0;
        this.total = 0;
    }

    public void enqueue(Paquete p) {
        // Construir la logica mediante el uso del operador modulo (%)
        if (total == queue.length) {
            System.out.println("Cola llena, no se puede agregar el paquete.");
            return;
        }
        queue[fin] = p;
        fin = (fin + 1) % queue.length; // Si fin llega al límite, vuelve a 0
        total++;
    }

    public Paquete dequeue() {
        // TODO: Implementar la logica fifo
        if (total == 0) {
            System.out.println("Cola vacía, no hay paquetes para despachar.");
            return null;
        }
        Paquete p = queue[frente];
        queue[frente] = null;                    // Liberar referencia
        frente = (frente + 1) % queue.length;   // Avanzar frente circularmente
        total--;
        return p;
    }
}
