package unl.edu.cc.APE07;

public class Paquete {
    private int id;
    private int codigoPostal;

    public Paquete(int id, int codigoPostal) {
        this.id = id;
        this.codigoPostal = codigoPostal;
    }

    public int getId() {
        return id;
    }

    public int getCodigoPostal() {
        return codigoPostal;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setCodigoPostal(int codigoPostal) {
        this.codigoPostal = codigoPostal;
    }

    @Override
    public String toString() {
        return "Paquete{" +
                "id=" + id +
                ", codigoPostal=" + codigoPostal +
                '}';
    }
}
