package com.trading212.backend.dto;

public class UserDTO {
    private String password;
    private String username;
    private int id;

    public UserDTO() {}

    public UserDTO(String password, String username, int id) {
        this.password = password;
        this.username = username;
        this.id = id;
    }

    public String getPassword(){
        return password;
    }

    public String getUsername(){
        return username;
    }

    public int getId(){
        return id;
    }

    public void setPassword(String password){
        this.password = password;
    }

    public void setUsername(String username){
        this.username = username;
    }

    public void setId(int id){
        this.id = id;
    }

}
