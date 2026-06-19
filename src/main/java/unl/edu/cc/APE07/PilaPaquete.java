package unl.edu.cc.APE07;

public class PilaPaquete {
        private Paquete[] stack;
        private int top;

        public PilaPaquete(int capacidad) {
            this.stack = new Paquete[capacidad];
            this.top = -1;
        }

        public void push(Paquete p) {
            // LIFO
            if (top == stack.length - 1) {
                System.out.println("Pila llena, no se puede agregar el paquete.");
                return;
            }
            stack[++top] = p; // Primero incrementa top, luego inserta
        }

        public Paquete pop() {
            if (top == -1) {
                System.out.println("Pila vacía, no hay paquetes para despachar.");
                return null;
            }
            Paquete p = stack[top];
            stack[top--] = null; // Libera referencia, luego decrementa top
            return p;
        }
    }
